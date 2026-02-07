import { useState, useRef, useEffect } from "react";
import { useMessaging, Conversation } from "@/hooks/useMessaging";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageCircle, Send, ArrowLeft, Plus, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

interface MessagingPanelProps {
  open: boolean;
  onClose: () => void;
}

const MessagingPanel = ({ open, onClose }: MessagingPanelProps) => {
  const {
    conversations,
    messages,
    participants,
    loadingConversations,
    loadingMessages,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    sendingMessage,
    createConversation,
    creatingConversation,
    getProfileByUserId,
  } = useMessaging();

  const [messageInput, setMessageInput] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  // Fetch all users with roles for starting conversations
  const { data: allUsers = [] } = useQuery({
    queryKey: ["all-users-for-messaging"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, position")
        .eq("is_profile_complete", true);
      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!messageInput.trim() || !activeConversationId) return;
    sendMessage({ conversationId: activeConversationId, content: messageInput.trim() });
    setMessageInput("");
  };

  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) return;
    const type = selectedUsers.length > 1 ? "group" : "direct";
    await createConversation({
      type,
      name: type === "group" ? groupName || "Group Chat" : undefined,
      participantIds: selectedUsers,
    });
    setNewChatOpen(false);
    setSelectedUsers([]);
    setGroupName("");
  };

  const getConversationName = (convo: Conversation) => {
    if (convo.name) return convo.name;
    if (convo.type === "sales_inbox") return "Sales Inbox";
    // For direct chats, show the other person's name
    const otherParticipant = participants.find(p => p.user_id !== currentUserId && p.conversation_id === convo.id);
    if (otherParticipant) {
      const profile = getProfileByUserId(otherParticipant.user_id);
      return profile?.full_name || "Unknown";
    }
    return "Direct Message";
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  if (!open) return null;

  return (
    <div className="fixed right-4 bottom-4 w-96 h-[32rem] bg-background border border-border rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-foreground text-white">
        {activeConversationId ? (
          <>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8" onClick={() => setActiveConversationId(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {activeConversation ? getConversationName(activeConversation) : "Chat"}
              </p>
              <p className="text-xs text-white/50">
                {activeConversation?.type === "group" ? `${participants.length} members` : "Direct message"}
              </p>
            </div>
          </>
        ) : (
          <>
            <MessageCircle className="h-5 w-5" />
            <span className="font-medium flex-1">Messages</span>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8" onClick={() => setNewChatOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </>
        )}
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8" onClick={onClose}>
          ×
        </Button>
      </div>

      {/* Content */}
      {activeConversationId ? (
        // Chat View
        <div className="flex flex-col flex-1 min-h-0">
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {loadingMessages ? (
                <p className="text-center text-sm text-muted-foreground py-4">Loading...</p>
              ) : messages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">No messages yet. Say hello!</p>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.sender_id === currentUserId;
                  const senderProfile = getProfileByUserId(msg.sender_id);
                  return (
                    <div key={msg.id} className={cn("flex gap-2", isOwn ? "justify-end" : "justify-start")}>
                      {!isOwn && (
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarImage src={senderProfile?.avatar_url || undefined} />
                          <AvatarFallback className="text-[10px] bg-primary text-white">
                            {senderProfile?.full_name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn("max-w-[75%] rounded-lg px-3 py-2 text-sm", isOwn ? "bg-primary text-primary-foreground" : "bg-muted")}>
                        {!isOwn && (
                          <p className="text-[10px] font-medium mb-0.5 opacity-70">{senderProfile?.full_name || "Unknown"}</p>
                        )}
                        <p className="break-words">{msg.content}</p>
                        <p className={cn("text-[10px] mt-1", isOwn ? "text-primary-foreground/60" : "text-muted-foreground")}>
                          {format(new Date(msg.created_at), "h:mm a")}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="p-3 border-t border-border flex gap-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="text-sm"
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            />
            <Button size="icon" onClick={handleSend} disabled={sendingMessage || !messageInput.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        // Conversations List
        <ScrollArea className="flex-1">
          {loadingConversations ? (
            <p className="text-center text-sm text-muted-foreground py-8">Loading...</p>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setNewChatOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Start a conversation
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {conversations.map((convo) => (
                <button
                  key={convo.id}
                  className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center gap-3"
                  onClick={() => setActiveConversationId(convo.id)}
                >
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {convo.type === "group" || convo.type === "sales_inbox" ? (
                      <Users className="h-4 w-4 text-primary" />
                    ) : (
                      <User className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium truncate">{getConversationName(convo)}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                        {format(new Date(convo.updated_at), "MMM d")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {convo.type === "group" ? "Group" : convo.type === "sales_inbox" ? "Sales" : "Direct"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      )}

      {/* New Chat Dialog */}
      <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedUsers.length > 1 && (
              <div>
                <Label>Group Name</Label>
                <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="e.g. Project Alpha Team" />
              </div>
            )}
            <div>
              <Label>Select team members</Label>
              <ScrollArea className="h-48 border rounded-md mt-2">
                <div className="p-2 space-y-1">
                  {allUsers
                    .filter(u => u.user_id !== currentUserId)
                    .map((user) => (
                      <label key={user.user_id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer">
                        <Checkbox
                          checked={selectedUsers.includes(user.user_id)}
                          onCheckedChange={(checked) => {
                            setSelectedUsers(prev =>
                              checked ? [...prev, user.user_id] : prev.filter(id => id !== user.user_id)
                            );
                          }}
                        />
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback className="text-[10px] bg-primary text-white">
                            {user.full_name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.full_name || "Unknown"}</p>
                          <p className="text-[10px] text-muted-foreground">{user.position || ""}</p>
                        </div>
                      </label>
                    ))}
                </div>
              </ScrollArea>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline">{selectedUsers.length} selected</Badge>
              {selectedUsers.length > 1 && <span>→ Group chat</span>}
              {selectedUsers.length === 1 && <span>→ Direct message</span>}
            </div>
            <Button className="w-full" onClick={handleCreateConversation} disabled={selectedUsers.length === 0 || creatingConversation}>
              {selectedUsers.length > 1 ? "Create Group" : "Start Chat"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessagingPanel;
