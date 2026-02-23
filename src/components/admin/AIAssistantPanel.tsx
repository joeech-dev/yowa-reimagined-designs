import { useState, useRef, useEffect } from "react";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, Trash2, FileText, Users, CalendarCheck, MessageSquare, Loader2, Search } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

const quickActions = [
  { label: "Generate Blog Post", action: "generate_blog", icon: FileText, prompt: "Write a blog post about sustainable urban development in East Africa" },
  { label: "Analyze Leads", action: "analyze_lead", icon: Users, prompt: "Analyze the current leads pipeline and suggest follow-up strategies" },
  { label: "Schedule Followups", action: "schedule_followup", icon: CalendarCheck, prompt: "Suggest follow-up schedules for active leads" },
  { label: "SEO Intelligence", action: "seo_analysis", icon: Search, prompt: "__FETCH_GSC__" },
];

const AIAssistantPanel = () => {
  const { messages, isLoading, sendMessage, clearMessages, setMessages } = useAIAssistant();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const [isFetchingGsc, setIsFetchingGsc] = useState(false);

  const handleSend = async (prompt?: string, action?: string) => {
    let text = prompt || input.trim();
    if (!text) return;

    // If SEO analysis, fetch GSC data first and inject into prompt
    if (text === "__FETCH_GSC__") {
      setIsFetchingGsc(true);
      const userMsg = "Analyze our Google Search Console data and give SEO recommendations, content gaps, and performance insights.";
      try {
        const { data: gscData, error } = await supabase.functions.invoke("gsc-analytics", {
          body: { report: "ai_analysis" },
        });
        if (error) throw error;
        text = `${userMsg}\n\nHere is the raw Google Search Console data for yowa.us (last 28 days):\n\n${JSON.stringify(gscData, null, 2)}`;
      } catch (e: any) {
        setMessages((prev) => [...prev, { role: "user", content: userMsg }, { role: "assistant", content: `Error fetching search data: ${e.message}` }]);
        setIsFetchingGsc(false);
        return;
      }
      setIsFetchingGsc(false);
    }

    setInput("");
    await sendMessage(text, action);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-secondary" />
            AI Assistant
          </h2>
          <p className="text-muted-foreground mt-1">Your intelligent business companion powered by AI</p>
        </div>
        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearMessages}>
            <Trash2 className="h-4 w-4 mr-2" /> Clear Chat
          </Button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {quickActions.map((qa) => {
          const Icon = qa.icon;
          return (
            <Card
              key={qa.action}
              className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
              onClick={() => handleSend(qa.prompt, qa.action)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{qa.label}</p>
                  <p className="text-xs text-muted-foreground">Click to run</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chat Area */}
      <Card className="flex flex-col" style={{ height: "500px" }}>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Chat
            {isLoading && <Badge variant="secondary" className="text-xs"><Loader2 className="h-3 w-3 animate-spin mr-1" />Thinking...</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">How can I help you today?</p>
                <p className="text-sm mt-1">Use the quick actions above or type your question below.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}>
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="border-t p-4 flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything... generate content, analyze data, get insights"
              className="min-h-[44px] max-h-[120px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button onClick={() => handleSend()} disabled={isLoading || !input.trim()} size="icon" className="shrink-0">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistantPanel;
