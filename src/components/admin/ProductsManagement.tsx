import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, BookOpen, Video, Camera, FileText, Package, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string;
  product_type: string;
  image_url: string | null;
  purchase_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

const productTypeOptions = [
  { value: "ebook", label: "eBook", icon: BookOpen },
  { value: "video", label: "Video", icon: Video },
  { value: "photo", label: "Photo", icon: Camera },
  { value: "film_script", label: "Film Script", icon: FileText },
  { value: "other", label: "Other", icon: Package },
];

const getTypeIcon = (type: string) => {
  const opt = productTypeOptions.find(o => o.value === type);
  return opt?.icon || Package;
};

const emptyForm = {
  title: "",
  description: "",
  price: "",
  currency: "USD",
  product_type: "ebook",
  image_url: "",
  purchase_url: "",
  is_active: true,
  display_order: 0,
};

const ProductsManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) {
      toast.error("Failed to load products");
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description || "",
      price: p.price?.toString() || "",
      currency: p.currency,
      product_type: p.product_type,
      image_url: p.image_url || "",
      purchase_url: p.purchase_url || "",
      is_active: p.is_active,
      display_order: p.display_order,
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    setForm(prev => ({ ...prev, image_url: urlData.publicUrl }));
    toast.success("Image uploaded");
    setUploading(false);
  };

  const removeImage = () => {
    setForm(prev => ({ ...prev, image_url: "" }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      price: form.price ? parseFloat(form.price) : null,
      currency: form.currency,
      product_type: form.product_type,
      image_url: form.image_url.trim() || null,
      purchase_url: form.purchase_url.trim() || null,
      is_active: form.is_active,
      display_order: form.display_order,
    };

    if (editingId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingId);
      if (error) { toast.error("Update failed"); return; }
      toast.success("Product updated");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast.error("Create failed"); return; }
      toast.success("Product created");
    }
    setDialogOpen(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error("Delete failed"); return; }
    toast.success("Product deleted");
    fetchProducts();
  };

  if (loading) return <p className="text-muted-foreground">Loading products...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground text-sm">Manage items available for sale on your shop page.</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Product</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(p => {
                const Icon = getTypeIcon(p.product_type);
                return (
                  <TableRow key={p.id}>
                    <TableCell><Icon className="h-5 w-5 text-muted-foreground" /></TableCell>
                    <TableCell>
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.title} className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          <Icon className="h-4 w-4 text-muted-foreground/40" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell>{p.price ? `${p.currency} ${p.price}` : "—"}</TableCell>
                    <TableCell>
                      <Badge variant={p.is_active ? "default" : "secondary"}>
                        {p.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.display_order}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {products.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No products yet. Add your first product above.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Product Type</Label>
                <Select value={form.product_type} onValueChange={v => setForm({ ...form, product_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {productTypeOptions.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price</Label>
                <Input type="number" placeholder="Leave empty if free" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <Label>Product Image</Label>
              {form.image_url ? (
                <div className="relative mt-2 inline-block">
                  <img src={form.image_url} alt="Product" className="h-32 w-auto rounded-lg object-cover border" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload Image"}
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Label>Purchase / Order URL</Label>
              <Input placeholder="https://..." value={form.purchase_url} onChange={e => setForm({ ...form, purchase_url: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Display Order</Label>
                <Input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
                <Label>Active</Label>
              </div>
            </div>
            <Button onClick={handleSave} className="w-full" disabled={uploading}>{editingId ? "Update Product" : "Create Product"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsManagement;
