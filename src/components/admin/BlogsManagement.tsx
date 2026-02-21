import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ExternalLink, Sparkles, Image, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RichTextEditor from "./RichTextEditor";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string | null;
  content: string | null;
  image: string | null;
  source_url: string;
  source_name: string;
  published_at: string;
  created_at: string | null;
}

const categories = ["Urbanism", "Livelihood", "Technology", "Agriculture", "Environment", "Education"];

const BlogsManagement = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const featuredImageRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "Technology",
    excerpt: "",
    content: "",
    image: "",
    source_url: "",
    source_name: "",
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("published_at", { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingBlog) {
        const { error } = await supabase
          .from("blog_posts")
          .update({
            title: formData.title,
            slug: formData.slug,
            category: formData.category,
            excerpt: formData.excerpt || null,
            content: formData.content || null,
            image: formData.image || null,
            source_url: formData.source_url,
            source_name: formData.source_name,
          })
          .eq("id", editingBlog.id);

        if (error) throw error;
        toast.success("Blog post updated");
      } else {
        // Auto-generate source_url if empty
        const sourceUrl = formData.source_url || `https://yowa.us/blog/${formData.slug}-${Date.now()}`;
        const sourceName = formData.source_name || "Yowa Innovations";
        const { error } = await supabase
          .from("blog_posts")
          .insert({
            title: formData.title,
            slug: formData.slug,
            category: formData.category,
            excerpt: formData.excerpt || null,
            content: formData.content || null,
            image: formData.image || null,
            source_url: sourceUrl,
            source_name: sourceName,
            published_at: new Date().toISOString(),
          });

        if (error) throw error;
        toast.success("Blog post created");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchBlogs();
    } catch (error) {
      console.error("Error saving blog:", error);
      toast.error("Failed to save blog post");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Blog post deleted");
      fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog post");
    }
  };

  const openEditDialog = (blog: BlogPost) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      category: blog.category,
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      image: blog.image || "",
      source_url: blog.source_url,
      source_name: blog.source_name,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingBlog(null);
    setFormData({
      title: "",
      slug: "",
      category: "Technology",
      excerpt: "",
      content: "",
      image: "",
      source_url: "",
      source_name: "",
    });
  };

  const handleFeaturedImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `featured/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("blog-images")
        .getPublicUrl(fileName);

      setFormData({ ...formData, image: publicUrl });
      toast.success("Featured image uploaded");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Blog Posts Management
              <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
            </CardTitle>
            <CardDescription>Create, edit, and manage your blog content</CardDescription>
          </div>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Input
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBlogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell className="font-medium max-w-xs truncate">{blog.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{blog.category}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{blog.source_name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(blog.published_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => window.open(blog.source_url, "_blank")}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(blog)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(blog.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {filteredBlogs.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            No blog posts found. Create your first post!
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBlog ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
            <DialogDescription>
              Fill in the details below to {editingBlog ? "update" : "create"} a blog post.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      title: e.target.value,
                      slug: generateSlug(e.target.value)
                    });
                  }}
                  placeholder="Enter blog title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="blog-post-slug"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Input
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Brief description of the blog post"
                />
              </div>

              <div className="grid gap-2">
                <Label>Featured Image</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Image URL or upload"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => featuredImageRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Image className="h-4 w-4" />
                    )}
                    <span className="ml-2">Upload</span>
                  </Button>
                </div>
                {formData.image && (
                  <img 
                    src={formData.image} 
                    alt="Featured preview" 
                    className="mt-2 max-h-40 rounded-md object-cover"
                  />
                )}
                <input
                  ref={featuredImageRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFeaturedImageUpload(file);
                    e.target.value = "";
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="source_url">Source URL</Label>
                  <Input
                    id="source_url"
                    value={formData.source_url}
                    onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="source_name">Source Name</Label>
                  <Input
                    id="source_name"
                    value={formData.source_name}
                    onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
                    placeholder="Yowa Innovations"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="mt-4">
              <div className="grid gap-2">
                <Label>Full Content (Markdown)</Label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  placeholder="Write your full blog post content here..."
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
              {editingBlog ? "Update" : "Create"} Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default BlogsManagement;
