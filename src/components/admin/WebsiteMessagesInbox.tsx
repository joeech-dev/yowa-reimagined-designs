import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserPlus, Check } from "lucide-react";
import { format } from "date-fns";
import { useEffect } from "react";

interface WebsiteMessage {
  id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string | null;
  message: string;
  service_interest: string | null;
  is_converted_to_lead: boolean;
  created_at: string;
}

const WebsiteMessagesInbox = () => {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["website-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("website_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as WebsiteMessage[];
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("website-messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "website_messages" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["website-messages"] });
          toast.info("New website message received!");
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const convertToLeadMutation = useMutation({
    mutationFn: async (msg: WebsiteMessage) => {
      // Create lead
      const { error: leadError } = await supabase.from("leads").insert([{
        name: msg.visitor_name,
        email: msg.visitor_email,
        phone: msg.visitor_phone || "Not provided",
        industry_type: msg.service_interest,
        status: "new",
      }]);
      if (leadError) throw leadError;

      // Mark as converted
      const { error: updateError } = await supabase
        .from("website_messages")
        .update({ is_converted_to_lead: true })
        .eq("id", msg.id);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["website-messages"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Converted to lead successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  const unconverted = messages.filter(m => !m.is_converted_to_lead).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Website Messages
          {unconverted > 0 && (
            <Badge variant="destructive" className="text-xs">{unconverted} new</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No messages from website visitors yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((msg) => (
                <TableRow key={msg.id}>
                  <TableCell className="text-xs">{format(new Date(msg.created_at), "MMM d, h:mm a")}</TableCell>
                  <TableCell className="font-medium">{msg.visitor_name}</TableCell>
                  <TableCell className="text-xs">{msg.visitor_email}</TableCell>
                  <TableCell>{msg.service_interest || "—"}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs">{msg.message}</TableCell>
                  <TableCell>
                    {msg.is_converted_to_lead ? (
                      <Badge variant="default" className="gap-1 text-xs"><Check className="h-3 w-3" /> Lead</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">New</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {!msg.is_converted_to_lead && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => convertToLeadMutation.mutate(msg)}
                        disabled={convertToLeadMutation.isPending}
                      >
                        <UserPlus className="h-3 w-3 mr-1" /> Convert
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default WebsiteMessagesInbox;
