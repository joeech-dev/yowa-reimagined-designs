import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAllBlogComments, useModerateComment, useDeleteComment, BlogComment } from "@/hooks/useBlogComments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  Trash2,
  Clock,
  Search,
  User,
  Mail,
  ExternalLink,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

interface BlogPostMap {
  [id: string]: { title: string; slug: string };
}

const statusBadge = (status: string) => {
  if (status === "approved") return <Badge className="bg-green-500/10 text-green-600 border-green-200">Approved</Badge>;
  if (status === "rejected") return <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-200">Rejected</Badge>;
  return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Pending</Badge>;
};

const BlogCommentsModeration = () => {
  const { data: comments = [], isLoading } = useAllBlogComments();
  const { mutate: moderate, isPending: isModerating } = useModerateComment();
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  // Fetch blog post titles for display
  const { data: blogPostsData } = useQuery({
    queryKey: ["blog-posts-minimal"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, slug");
      return data || [];
    },
  });

  const blogMap: BlogPostMap = (blogPostsData || []).reduce((acc, p) => {
    acc[p.id] = { title: p.title, slug: p.slug };
    return acc;
  }, {} as BlogPostMap);

  const filtered = comments.filter((c) => {
    const matchesTab =
      activeTab === "all" ? true : c.status === activeTab;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      c.author_name.toLowerCase().includes(q) ||
      c.author_email.toLowerCase().includes(q) ||
      c.content.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const pendingCount = comments.filter((c) => c.status === "pending").length;
  const approvedCount = comments.filter((c) => c.status === "approved").length;
  const rejectedCount = comments.filter((c) => c.status === "rejected").length;

  const handleApprove = (id: string) => {
    moderate(
      { id, status: "approved" },
      {
        onSuccess: () => toast.success("Comment approved and published."),
        onError: () => toast.error("Failed to approve comment."),
      }
    );
  };

  const handleReject = (id: string) => {
    moderate(
      { id, status: "rejected", rejection_reason: rejectReason },
      {
        onSuccess: () => {
          toast.success("Comment rejected.");
          setRejectingId(null);
          setRejectReason("");
        },
        onError: () => toast.error("Failed to reject comment."),
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteComment(id, {
      onSuccess: () => {
        toast.success("Comment deleted.");
        setDeleteId(null);
      },
      onError: () => toast.error("Failed to delete comment."),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Comment Moderation</h1>
        <p className="text-muted-foreground mt-1 text-sm">Review and approve reader comments before they go live.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" /> Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" /> Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" /> Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{rejectedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or content..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending {pendingCount > 0 && <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[10px]">{pendingCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-muted/40 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No {activeTab !== "all" ? activeTab : ""} comments found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((comment) => {
                const post = blogMap[comment.blog_post_id];
                return (
                  <Card key={comment.id} className="border-border">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Author info */}
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              {comment.author_name}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {comment.author_email}
                            </div>
                            {statusBadge(comment.status)}
                          </div>

                          {/* Blog post reference */}
                          {post && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                              <span>On:</span>
                              <Link
                                to={`/blog/${post.slug}`}
                                target="_blank"
                                className="text-primary hover:underline flex items-center gap-0.5"
                              >
                                {post.title}
                                <ExternalLink className="h-2.5 w-2.5" />
                              </Link>
                            </div>
                          )}

                          {/* Comment content */}
                          <p className="text-sm text-foreground/90 leading-relaxed bg-muted/30 rounded-lg p-3 mt-2 whitespace-pre-wrap">
                            {comment.content}
                          </p>

                          {comment.rejection_reason && (
                            <p className="text-xs text-red-500 mt-1.5">
                              Rejection reason: {comment.rejection_reason}
                            </p>
                          )}

                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(comment.created_at).toLocaleDateString("en-US", {
                              year: "numeric", month: "long", day: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 shrink-0">
                          {comment.status !== "approved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                              onClick={() => handleApprove(comment.id)}
                              disabled={isModerating}
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Approve
                            </Button>
                          )}
                          {comment.status !== "rejected" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                              onClick={() => setRejectingId(comment.id)}
                              disabled={isModerating}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Reject
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1.5 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteId(comment.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </div>

                      {/* Rejection reason input */}
                      {rejectingId === comment.id && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                          <p className="text-xs font-medium text-red-700 mb-2">Reason for rejection (optional)</p>
                          <Textarea
                            placeholder="e.g. Spam, inappropriate content..."
                            className="text-sm min-h-[60px] resize-none mb-2"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" variant="destructive" onClick={() => handleReject(comment.id)} disabled={isModerating}>
                              Confirm Reject
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => { setRejectingId(null); setRejectReason(""); }}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The comment will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={isDeleting}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BlogCommentsModeration;
