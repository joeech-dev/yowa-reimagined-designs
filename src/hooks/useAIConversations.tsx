import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AIConversationMessage = { role: "user" | "assistant"; content: string };

export type AIConversation = {
  id: string;
  title: string;
  messages: AIConversationMessage[];
  created_at: string;
  updated_at: string;
};

const titleFrom = (text: string) => {
  const clean = text.replace(/\s+/g, " ").trim();
  return (clean.length > 60 ? `${clean.slice(0, 57)}...` : clean) || "New conversation";
};

export const useAIConversations = () => {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    const { data, error } = await supabase
      .from("ai_conversations")
      .select("id, title, messages, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Failed to load AI conversations:", error.message);
      setIsLoading(false);
      return;
    }
    setConversations(
      (data || []).map((row) => ({
        ...row,
        messages: (row.messages as unknown as AIConversationMessage[]) || [],
      })) as AIConversation[]
    );
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  /** Creates a conversation row and returns its id, or null when saving fails. */
  const createConversation = useCallback(
    async (messages: AIConversationMessage[]): Promise<string | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const firstUser = messages.find((m) => m.role === "user");
      const { data, error } = await supabase
        .from("ai_conversations")
        .insert({
          user_id: user.id,
          title: titleFrom(firstUser?.content || ""),
          messages: messages as unknown as never,
        })
        .select("id, title, messages, created_at, updated_at")
        .single();

      if (error || !data) {
        console.error("Failed to save AI conversation:", error?.message);
        return null;
      }

      setConversations((prev) => [
        { ...data, messages: (data.messages as unknown as AIConversationMessage[]) || [] } as AIConversation,
        ...prev,
      ]);
      return data.id;
    },
    []
  );

  const saveMessages = useCallback(
    async (id: string, messages: AIConversationMessage[]) => {
      const { error } = await supabase
        .from("ai_conversations")
        .update({ messages: messages as unknown as never })
        .eq("id", id);

      if (error) {
        console.error("Failed to update AI conversation:", error.message);
        return;
      }
      const now = new Date().toISOString();
      setConversations((prev) =>
        prev
          .map((c) => (c.id === id ? { ...c, messages, updated_at: now } : c))
          .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      );
    },
    []
  );

  const deleteConversation = useCallback(async (id: string) => {
    const { error } = await supabase.from("ai_conversations").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete AI conversation:", error.message);
      return false;
    }
    setConversations((prev) => prev.filter((c) => c.id !== id));
    return true;
  }, []);

  return { conversations, isLoading, fetchConversations, createConversation, saveMessages, deleteConversation };
};
