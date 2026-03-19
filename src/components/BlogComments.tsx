import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MessageSquare, Send, CheckCircle, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useBlogComments, useSubmitComment } from "@/hooks/useBlogComments";
import { toast } from "sonner";

const commentSchema = z.object({
  author_name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  author_email: z
    .string()
    .trim()
    .email("Please enter a valid email")
    .max(255, "Email is too long"),
  content: z
    .string()
    .trim()
    .min(10, "Comment must be at least 10 characters")
    .max(2000, "Comment must be under 2000 characters"),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface BlogCommentsProps {
  blogPostId: string;
}

const BlogComments = ({ blogPostId }: BlogCommentsProps) => {
  const { data: comments = [], isLoading } = useBlogComments(blogPostId);
  const { mutate: submitComment, isPending } = useSubmitComment();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { author_name: "", author_email: "", content: "" },
  });

  const onSubmit = (values: CommentFormValues) => {
    submitComment(
      { blog_post_id: blogPostId, ...values },
      {
        onSuccess: () => {
          setSubmitted(true);
          form.reset();
        },
        onError: () => {
          toast.error("Failed to submit your comment. Please try again.");
        },
      }
    );
  };

  return (
    <section className="mt-12 pt-12 border-t border-border">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h2 className="font-display font-bold text-2xl text-foreground">
          Comments
          {comments.length > 0 && (
            <span className="ml-2 text-base text-muted-foreground font-normal">
              ({comments.length})
            </span>
          )}
        </h2>
      </div>

      {/* Approved Comments */}
      {isLoading ? (
        <div className="space-y-4 mb-10">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-muted/40 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-5 mb-10">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-5 rounded-xl bg-muted/30 border border-border/50"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{comment.author_name}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(comment.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm mb-10">
          No comments yet. Be the first to share your thoughts!
        </p>
      )}

      {/* Comment Form */}
      <div className="bg-muted/20 border border-border/50 rounded-xl p-6">
        <h3 className="font-display font-semibold text-lg mb-1 text-foreground">
          Leave a Comment
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Comments are reviewed before appearing. Your email won't be published.
        </p>

        {submitted ? (
          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <CheckCircle className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="font-medium text-sm text-foreground">Thank you for your comment!</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                It will appear after our team reviews it — usually within 24 hours.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-xs"
              onClick={() => setSubmitted(false)}
            >
              Write another
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="author_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="author_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="jane@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comment *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your thoughts, questions, or insights..."
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between items-center">
                      <FormMessage />
                      <span className="text-xs text-muted-foreground ml-auto">
                        {field.value.length}/2000
                      </span>
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isPending} className="gap-2">
                <Send className="h-4 w-4" />
                {isPending ? "Submitting..." : "Submit Comment"}
              </Button>
            </form>
          </Form>
        )}
      </div>
    </section>
  );
};

export default BlogComments;
