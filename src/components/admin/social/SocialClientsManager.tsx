import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useSocialMediaClients, useCreateSocialMediaClient, useUpdateSocialMediaClient, useDeleteSocialMediaClient } from "@/hooks/useSocialMediaReports";
import { PlusCircle, Pencil, Trash2, Users, Link } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PLATFORM_CONFIG } from "./platformConfig";

const schema = z.object({
  name: z.string().min(1, "Client name required"),
  contact_person: z.string().optional(),
  contact_email: z.string().email("Invalid email").optional().or(z.literal("")),
  industry: z.string().optional(),
  platforms: z.array(z.string()).min(1, "Select at least one platform"),
  channel_links: z.record(z.string()).optional(),
});

type FormValues = z.infer<typeof schema>;

export function SocialClientsManager() {
  const { data: clients, isLoading } = useSocialMediaClients();
  const createClient = useCreateSocialMediaClient();
  const updateClient = useUpdateSocialMediaClient();
  const deleteClient = useDeleteSocialMediaClient();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", contact_person: "", contact_email: "", industry: "", platforms: [], channel_links: {} },
  });

  const watchedPlatforms = form.watch("platforms");
  const watchedLinks = form.watch("channel_links") || {};

  async function onSubmit(values: FormValues) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      name: values.name,
      contact_person: values.contact_person || null,
      contact_email: values.contact_email || null,
      industry: values.industry || null,
      platforms: values.platforms,
      channel_links: values.channel_links || {},
      is_active: true,
      created_by: user.id,
    };

    if (editingId) {
      await updateClient.mutateAsync({ id: editingId, ...payload });
    } else {
      await createClient.mutateAsync(payload as any);
    }
    setOpen(false);
    setEditingId(null);
    form.reset();
  }

  function openEdit(client: any) {
    setEditingId(client.id);
    form.reset({
      name: client.name,
      contact_person: client.contact_person || "",
      contact_email: client.contact_email || "",
      industry: client.industry || "",
      platforms: client.platforms || [],
      channel_links: client.channel_links || {},
    });
    setOpen(true);
  }

  function openNew() {
    setEditingId(null);
    form.reset({ name: "", contact_person: "", contact_email: "", industry: "", platforms: [], channel_links: {} });
    setOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">{clients?.length || 0} Clients</span>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditingId(null); form.reset(); } }}>
          <DialogTrigger asChild>
            <Button onClick={openNew} size="sm">
              <PlusCircle className="h-4 w-4 mr-2" /> Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Client" : "Add New Client"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Client / Brand Name *</Label>
                <Input {...form.register("name")} placeholder="e.g. Sunrise Coffee" />
                {form.formState.errors.name && <p className="text-destructive text-xs">{form.formState.errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Contact Person</Label>
                  <Input {...form.register("contact_person")} placeholder="Name" />
                </div>
                <div className="space-y-1.5">
                  <Label>Industry</Label>
                  <Input {...form.register("industry")} placeholder="e.g. F&B" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Contact Email</Label>
                <Input {...form.register("contact_email")} type="email" placeholder="client@example.com" />
                {form.formState.errors.contact_email && <p className="text-destructive text-xs">{form.formState.errors.contact_email.message}</p>}
              </div>

              {/* Platform selection */}
              <div className="space-y-2">
                <Label>Platforms Managed *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => {
                    const checked = watchedPlatforms.includes(key);
                    return (
                      <label key={key} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${checked ? "border-primary bg-primary/5" : "border-border"}`}>
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => {
                            const cur = form.getValues("platforms");
                            const next = v ? [...cur, key] : cur.filter((p) => p !== key);
                            form.setValue("platforms", next);
                            // Clear link if platform deselected
                            if (!v) {
                              const links = { ...(form.getValues("channel_links") || {}) };
                              delete links[key];
                              form.setValue("channel_links", links);
                            }
                          }}
                        />
                        <span className="text-lg">{cfg.icon}</span>
                        <span className="text-sm font-medium">{cfg.label}</span>
                      </label>
                    );
                  })}
                </div>
                {form.formState.errors.platforms && <p className="text-destructive text-xs">{form.formState.errors.platforms.message}</p>}
              </div>

              {/* Channel links for selected platforms */}
              {watchedPlatforms.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Link className="h-4 w-4 text-muted-foreground" />
                    <Label>Channel / Profile Links</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">Paste the direct URL to each platform page for quick access and performance tracking.</p>
                  <div className="space-y-2">
                    {watchedPlatforms.map((p) => {
                      const cfg = PLATFORM_CONFIG[p];
                      if (!cfg) return null;
                      return (
                        <div key={p} className="flex items-center gap-2">
                          <span className="text-base w-6 text-center shrink-0">{cfg.icon}</span>
                          <Input
                            placeholder={cfg.urlPlaceholder}
                            value={watchedLinks[p] || ""}
                            onChange={(e) => {
                              const links = { ...(form.getValues("channel_links") || {}) };
                              links[p] = e.target.value;
                              form.setValue("channel_links", links);
                            }}
                            className="h-8 text-sm"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={createClient.isPending || updateClient.isPending} className="flex-1">
                  {editingId ? "Update Client" : "Add Client"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading clients...</div>
      ) : (
        <div className="grid gap-3">
          {clients?.map((client) => {
            const channelLinks = (client as any).channel_links || {};
            const linkedPlatforms = client.platforms?.filter((p) => channelLinks[p]);
            return (
              <Card key={client.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{client.name}</span>
                        <Badge variant={client.is_active ? "default" : "secondary"} className="text-xs">
                          {client.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {client.contact_person && <p className="text-sm text-muted-foreground">{client.contact_person} {client.contact_email && `• ${client.contact_email}`}</p>}
                      {client.industry && <p className="text-xs text-muted-foreground">{client.industry}</p>}
                      <div className="flex gap-1 flex-wrap mt-2">
                        {client.platforms?.map((p) => {
                          const link = channelLinks[p];
                          const cfg = PLATFORM_CONFIG[p];
                          return link ? (
                            <a key={p} href={link} target="_blank" rel="noopener noreferrer">
                              <Badge variant="outline" className="text-xs gap-1 hover:bg-primary/10 cursor-pointer transition-colors">
                                <span>{cfg?.icon}</span> {cfg?.label || p}
                                <Link className="h-2.5 w-2.5 ml-0.5 opacity-60" />
                              </Badge>
                            </a>
                          ) : (
                            <Badge key={p} variant="outline" className="text-xs gap-1">
                              <span>{cfg?.icon}</span> {cfg?.label || p}
                            </Badge>
                          );
                        })}
                      </div>
                      {linkedPlatforms && linkedPlatforms.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Link className="h-3 w-3" /> {linkedPlatforms.length} channel link{linkedPlatforms.length > 1 ? "s" : ""} saved
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(client)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete {client.name}?</AlertDialogTitle>
                            <AlertDialogDescription>This will delete the client and all their report data permanently.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteClient.mutate(client.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {!clients?.length && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No clients yet. Add your first social media client above.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
