import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Clock, Tag, UserPlus, Users } from "lucide-react";
import { useSequenceSteps, useLeadAssignments, type FollowupSequence } from "@/hooks/useFollowupSequences";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  sequence: FollowupSequence;
  onBack: () => void;
  onUpdate: (id: string, updates: Partial<FollowupSequence>) => Promise<void>;
}

const SequenceDetail = ({ sequence, onBack, onUpdate }: Props) => {
  const { steps, loading: stepsLoading, addStep, deleteStep } = useSequenceSteps(sequence.id);
  const { assignments, loading: assignLoading, assignLead, removeAssignment } = useLeadAssignments(sequence.id);

  const [showAddStep, setShowAddStep] = useState(false);
  const [stepDelayDays, setStepDelayDays] = useState("1");
  const [stepTag, setStepTag] = useState("");
  const [stepSubject, setStepSubject] = useState("");
  const [stepDesc, setStepDesc] = useState("");

  const [showAssign, setShowAssign] = useState(false);
  const [availableLeads, setAvailableLeads] = useState<{ id: string; name: string; email: string }[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState("");

  const handleAddStep = async () => {
    if (!stepTag.trim()) { toast.error("Tag name is required"); return; }
    try {
      await addStep({
        delay_days: parseInt(stepDelayDays) || 0,
        tag_name: stepTag.trim(),
        email_subject: stepSubject.trim() || undefined,
        description: stepDesc.trim() || undefined,
      });
      toast.success("Step added");
      setShowAddStep(false);
      setStepDelayDays("1"); setStepTag(""); setStepSubject(""); setStepDesc("");
    } catch { toast.error("Failed to add step"); }
  };

  const fetchAvailableLeads = async () => {
    const { data } = await supabase
      .from("leads")
      .select("id, name, email")
      .in("status", ["new", "contacted"])
      .order("name");
    setAvailableLeads(data || []);
  };

  const handleAssignLead = async () => {
    if (!selectedLeadId) return;
    try {
      await assignLead(selectedLeadId);
      toast.success("Lead assigned to sequence");
      setShowAssign(false);
      setSelectedLeadId("");
    } catch { toast.error("Failed to assign lead (may already be assigned)"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{sequence.name}</h2>
          {sequence.description && <p className="text-sm text-muted-foreground">{sequence.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={sequence.auto_assign_new_leads}
            onCheckedChange={async (v) => {
              await onUpdate(sequence.id, { auto_assign_new_leads: v });
              toast.success(v ? "Auto-assign enabled" : "Auto-assign disabled");
            }}
          />
          <Label className="text-sm">Auto-assign new leads</Label>
        </div>
        <Badge variant={sequence.is_active ? "default" : "secondary"}>
          {sequence.is_active ? "Active" : "Paused"}
        </Badge>
      </div>

      <Tabs defaultValue="steps">
        <TabsList>
          <TabsTrigger value="steps" className="flex items-center gap-1">
            <Tag className="h-3 w-3" /> Steps ({steps.length})
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex items-center gap-1">
            <Users className="h-3 w-3" /> Assigned Leads ({assignments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="steps">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Sequence Steps</CardTitle>
                  <CardDescription>Each step applies a tag in systeme.io after a delay</CardDescription>
                </div>
                <Dialog open={showAddStep} onOpenChange={setShowAddStep}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Step</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Sequence Step</DialogTitle>
                      <DialogDescription>Define the delay and tag for this step</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Delay (days after previous step)</Label>
                        <Input type="number" min="0" value={stepDelayDays} onChange={e => setStepDelayDays(e.target.value)} />
                      </div>
                      <div>
                        <Label>Systeme.io Tag Name</Label>
                        <Input value={stepTag} onChange={e => setStepTag(e.target.value)} placeholder="e.g. sequence-welcome-day1" />
                        <p className="text-xs text-muted-foreground mt-1">This tag triggers the corresponding email campaign in systeme.io</p>
                      </div>
                      <div>
                        <Label>Email Subject (reference)</Label>
                        <Input value={stepSubject} onChange={e => setStepSubject(e.target.value)} placeholder="e.g. Welcome to Yowa!" />
                      </div>
                      <div>
                        <Label>Description (optional)</Label>
                        <Input value={stepDesc} onChange={e => setStepDesc(e.target.value)} placeholder="What this step does..." />
                      </div>
                      <Button onClick={handleAddStep} className="w-full">Add Step</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {stepsLoading ? (
                <div className="text-center py-4 text-muted-foreground">Loading...</div>
              ) : steps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No steps yet. Add steps to define the sequence flow.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {steps.map((step, idx) => (
                    <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {step.delay_days === 0 ? "Immediately" : `Day ${steps.slice(0, idx + 1).reduce((sum, s) => sum + s.delay_days, 0)}`}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            (+{step.delay_days}d)
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Tag className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="outline" className="text-xs">{step.tag_name}</Badge>
                          {step.email_subject && (
                            <span className="text-sm text-muted-foreground">— {step.email_subject}</span>
                          )}
                        </div>
                        {step.description && <p className="text-xs text-muted-foreground mt-1">{step.description}</p>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => { deleteStep(step.id); toast.success("Step removed"); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Assigned Leads</CardTitle>
                  <CardDescription>Leads currently in this sequence</CardDescription>
                </div>
                <Dialog open={showAssign} onOpenChange={(v) => { setShowAssign(v); if (v) fetchAvailableLeads(); }}>
                  <DialogTrigger asChild>
                    <Button size="sm"><UserPlus className="h-4 w-4 mr-1" />Assign Lead</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assign Lead to Sequence</DialogTitle>
                      <DialogDescription>Select a lead to add to this follow-up sequence</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a lead..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableLeads.map(lead => (
                            <SelectItem key={lead.id} value={lead.id}>
                              {lead.name} ({lead.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleAssignLead} className="w-full" disabled={!selectedLeadId}>Assign</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {assignLoading ? (
                <div className="text-center py-4 text-muted-foreground">Loading...</div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No leads assigned to this sequence yet.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead</TableHead>
                      <TableHead>Current Step</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next Due</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map(a => (
                      <TableRow key={a.id}>
                        <TableCell>
                          <div className="font-medium">{a.lead_name || "Unknown"}</div>
                          <div className="text-xs text-muted-foreground">{a.lead_email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Step {a.current_step_order}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={a.status === "active" ? "default" : a.status === "completed" ? "secondary" : "destructive"}>
                            {a.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {a.next_step_due_at ? new Date(a.next_step_due_at).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => { removeAssignment(a.id); toast.success("Lead removed from sequence"); }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SequenceDetail;
