import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Phone, Mail, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const WHATSAPP_PHONE = "+256779180984";
const EMAIL = "info@yowainnovations.com";
const SESSION_KEY = "yowa_chat_session_id";
const CONV_KEY = "yowa_chat_conversation_id";
const MSGS_KEY = "yowa_chat_messages";

type ChatMsg = { role: "user" | "assistant"; content: string };

const INITIAL_GREETING: ChatMsg = {
  role: "assistant",
  content:
    "Hi there! 👋 I'm **Yowa Assist**, your friendly guide to Yowa Innovations. Whether you're planning a documentary, a marketing campaign, or a creative project — I'm here to help. What are you working on?",
};

const QUICK_STARTERS = [
  "I need documentary production",
  "Tell me about your digital marketing",
  "I'd like a quote",
  "What services do you offer?",
];

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let s = window.localStorage.getItem(SESSION_KEY);
  if (!s) {
    s = crypto.randomUUID();
    window.localStorage.setItem(SESSION_KEY, s);
  }
  return s;
}

export const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([INITIAL_GREETING]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionId] = useState<string>(() => getOrCreateSessionId());
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Restore prior messages
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedMsgs = window.localStorage.getItem(MSGS_KEY);
    const savedConv = window.localStorage.getItem(CONV_KEY);
    if (savedMsgs) {
      try {
        const parsed: ChatMsg[] = JSON.parse(savedMsgs);
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      } catch { /* ignore */ }
    }
    if (savedConv) setConversationId(savedConv);
  }, []);

  // Persist messages
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(MSGS_KEY, JSON.stringify(messages));
  }, [messages]);

  // Autoscroll & focus
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const openWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Hi! I'd like to talk to your team.")}`, "_blank", "noopener");
  };
  const openEmail = () => { window.location.href = `mailto:${EMAIL}?subject=Project Inquiry`; };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setInput("");
    setMessages(m => [...m, { role: "user", content: trimmed }]);
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("sales-chat", {
        body: { session_id: sessionId, message: trimmed, conversation_id: conversationId },
      });
      if (error) throw error;
      const reply: string = data?.reply ?? "Sorry, I didn't quite catch that.";
      const convId: string | undefined = data?.conversation_id;
      if (convId) {
        setConversationId(convId);
        if (typeof window !== "undefined") window.localStorage.setItem(CONV_KEY, convId);
      }
      setMessages(m => [...m, { role: "assistant", content: reply }]);
      if (data?.lead_captured) {
        toast.success("Thanks! Our team has been notified and will reach out shortly.");
      }
    } catch (err: any) {
      console.error("chat error", err);
      const msg = err?.message?.includes("429")
        ? "I'm getting a lot of questions right now — please try again in a moment."
        : "Something went wrong. Please try again, or WhatsApp us directly.";
      setMessages(m => [...m, { role: "assistant", content: msg }]);
      toast.error("Chat failed. Try again shortly.");
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const resetChat = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(CONV_KEY);
      window.localStorage.removeItem(MSGS_KEY);
    }
    setConversationId(null);
    setMessages([INITIAL_GREETING]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className={cn(
          "absolute bottom-16 right-0 w-[22rem] max-w-[calc(100vw-3rem)] transition-all duration-300 origin-bottom-right",
          open ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        )}
      >
        <Card className="shadow-xl border-border overflow-hidden flex flex-col h-[560px] max-h-[calc(100vh-6rem)]">
          <CardHeader className="bg-primary text-primary-foreground pb-3 pt-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-primary" />
                </div>
                <div>
                  <CardTitle className="text-base leading-tight">Yowa Assist</CardTitle>
                  <p className="text-[11px] opacity-90 leading-tight">AI-powered · Replies instantly</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-white/20 h-8 w-8"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/30">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-background border border-border rounded-bl-sm"
                  )}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-strong:text-foreground prose-a:text-primary [&_ul]:my-1 [&_ol]:my-1">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-background border border-border rounded-2xl rounded-bl-sm px-3 py-2 text-sm flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" />
                </div>
              </div>
            )}
            {messages.length === 1 && !sending && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {QUICK_STARTERS.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-2.5 py-1.5 rounded-full border border-border bg-background hover:bg-accent transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <CardContent className="p-2 border-t border-border flex-shrink-0 space-y-2">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              className="flex gap-1.5"
            >
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={sending}
                className="h-9 text-sm"
              />
              <Button type="submit" size="icon" className="h-9 w-9 flex-shrink-0" disabled={sending || !input.trim()}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={openWhatsApp}>
                  <Phone className="h-3 w-3" /> WhatsApp
                </Button>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={openEmail}>
                  <Mail className="h-3 w-3" /> Email
                </Button>
              </div>
              {messages.length > 1 && (
                <button
                  onClick={resetChat}
                  className="text-[10px] text-muted-foreground hover:text-foreground underline"
                >
                  New chat
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toggle Button */}
      <Button
        size="lg"
        className={cn(
          "rounded-full h-14 w-14 shadow-lg transition-all duration-300 relative",
          open ? "bg-foreground hover:bg-foreground/90" : "bg-primary hover:bg-primary/90"
        )}
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
          </span>
        )}
      </Button>
    </div>
  );
};

export default ChatWidget;
