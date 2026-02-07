import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Conversation {
  id: string;
  type: "direct" | "group" | "sales_inbox";
  name: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface Participant {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
}

export interface UserProfile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  position: string | null;
}

export const useMessaging = () => {
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Fetch all conversations the user is part of
  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Conversation[];
    },
  });

  // Fetch messages for active conversation
  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["messages", activeConversationId],
    queryFn: async () => {
      if (!activeConversationId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeConversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!activeConversationId,
  });

  // Fetch participants for active conversation
  const { data: participants = [] } = useQuery({
    queryKey: ["participants", activeConversationId],
    queryFn: async () => {
      if (!activeConversationId) return [];
      const { data, error } = await supabase
        .from("conversation_participants")
        .select("*")
        .eq("conversation_id", activeConversationId);
      if (error) throw error;
      return data as Participant[];
    },
    enabled: !!activeConversationId,
  });

  // Fetch all team profiles for user lookup
  const { data: profiles = [] } = useQuery({
    queryKey: ["team-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, position");
      if (error) throw error;
      return data as UserProfile[];
    },
  });

  // Real-time subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMessage = payload.new as Message;
          // Update messages if it's the active conversation
          queryClient.invalidateQueries({ queryKey: ["messages", newMessage.conversation_id] });
          // Update conversation list (for ordering)
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Send a message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("messages").insert([{
        conversation_id: conversationId,
        sender_id: user.id,
        content,
      }]);
      if (error) throw error;

      // Update conversation timestamp
      await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["messages", vars.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // Create a new conversation
  const createConversationMutation = useMutation({
    mutationFn: async ({ type, name, participantIds }: { type: "direct" | "group"; name?: string; participantIds: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // For direct chats, check if conversation already exists
      if (type === "direct" && participantIds.length === 1) {
        const existingConvos = conversations.filter(c => c.type === "direct");
        for (const convo of existingConvos) {
          const { data: parts } = await supabase
            .from("conversation_participants")
            .select("user_id")
            .eq("conversation_id", convo.id);
          const userIds = parts?.map(p => p.user_id) || [];
          if (userIds.includes(user.id) && userIds.includes(participantIds[0]) && userIds.length === 2) {
            return convo;
          }
        }
      }

      const { data: convo, error: convoError } = await supabase
        .from("conversations")
        .insert([{ type, name: name || null, created_by: user.id }])
        .select()
        .single();
      if (convoError) throw convoError;

      // Add creator as participant
      const allParticipants = [user.id, ...participantIds.filter(id => id !== user.id)];
      const { error: partError } = await supabase
        .from("conversation_participants")
        .insert(allParticipants.map(uid => ({ conversation_id: convo.id, user_id: uid })));
      if (partError) throw partError;

      return convo as Conversation;
    },
    onSuccess: (convo) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (convo) setActiveConversationId(convo.id);
    },
  });

  const getProfileByUserId = useCallback((userId: string) => {
    return profiles.find(p => p.user_id === userId);
  }, [profiles]);

  return {
    conversations,
    messages,
    participants,
    profiles,
    loadingConversations,
    loadingMessages,
    activeConversationId,
    setActiveConversationId,
    sendMessage: sendMessageMutation.mutate,
    sendingMessage: sendMessageMutation.isPending,
    createConversation: createConversationMutation.mutateAsync,
    creatingConversation: createConversationMutation.isPending,
    getProfileByUserId,
  };
};
