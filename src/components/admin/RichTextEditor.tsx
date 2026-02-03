import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Link,
  Image,
  Quote,
  Code,
  Upload,
  Loader2,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const insertAtCursor = useCallback((before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Set cursor position after update
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [value, onChange]);

  const formatBold = () => insertAtCursor("**", "**");
  const formatItalic = () => insertAtCursor("*", "*");
  const formatH1 = () => insertAtCursor("\n# ", "\n");
  const formatH2 = () => insertAtCursor("\n## ", "\n");
  const formatList = () => insertAtCursor("\n- ");
  const formatOrderedList = () => insertAtCursor("\n1. ");
  const formatQuote = () => insertAtCursor("\n> ");
  const formatCode = () => insertAtCursor("`", "`");
  const formatLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      insertAtCursor("[", `](${url})`);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `blog-content/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("blog-images")
        .getPublicUrl(filePath);

      insertAtCursor(`\n![${file.name}](${publicUrl})\n`);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const toolbarButtons = [
    { icon: Bold, action: formatBold, title: "Bold" },
    { icon: Italic, action: formatItalic, title: "Italic" },
    { icon: Heading1, action: formatH1, title: "Heading 1" },
    { icon: Heading2, action: formatH2, title: "Heading 2" },
    { icon: List, action: formatList, title: "Bullet List" },
    { icon: ListOrdered, action: formatOrderedList, title: "Numbered List" },
    { icon: Quote, action: formatQuote, title: "Quote" },
    { icon: Code, action: formatCode, title: "Code" },
    { icon: Link, action: formatLink, title: "Link" },
  ];

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-muted/50 rounded-t-md border border-b-0 border-input">
        {toolbarButtons.map(({ icon: Icon, action, title }) => (
          <Button
            key={title}
            type="button"
            variant="ghost"
            size="sm"
            onClick={action}
            title={title}
            className="h-8 w-8 p-0"
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
        <div className="w-px bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Upload Image"
          className="h-8 w-8 p-0"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Image className="h-4 w-4" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Upload from Device"
          className="h-8 px-2 gap-1"
        >
          <Upload className="h-4 w-4" />
          <span className="text-xs">Upload</span>
        </Button>
      </div>

      {/* Editor */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="relative"
      >
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Write your content here... (Supports Markdown)\n\nDrag and drop images to upload them."}
          className="min-h-[400px] rounded-t-none font-mono text-sm resize-y"
        />
        {uploading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Uploading image...</span>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        Supports Markdown formatting. Drag & drop images or use the upload button.
      </p>
    </div>
  );
};

export default RichTextEditor;
