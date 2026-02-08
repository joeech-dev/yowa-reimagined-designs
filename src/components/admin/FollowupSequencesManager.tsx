import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Play, Pause, ChevronRight, Mail, Clock, Tag } from "lucide-react";
import { useFollowupSequences, useSequenceSteps, useLeadAssignments } from "@/hooks/useFollowupSequences";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SequenceDetail from "./SequenceDetail";

const FollowupSequencesManager = () => {
  const { sequences, loading, createSequence, updateSequence, deleteSequence } = useFollowupSequences();
  const [selectedSequenceId, setSelectedSequenceId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newAutoAssign, setNewAutoAssign] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) { toast.error("Name is required"); return; }
    try {
      await createSequence(newName.trim(), newDesc.trim(), newAutoAssign);
      toast.success("Sequence created");
      setShowCreate(false);
      setNewName(""); setNewDesc(""); setNewAutoAssign(false);
    } catch (error) {
      toast.error("Failed to create sequence");
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await updateSequence(id, { is_active: !current });
      toast.success(`Sequence ${!current ? "activated" : "paused"}`);
    } catch { toast.error("Failed to update"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSequence(id);
      if (selectedSequenceId === id) setSelectedSequenceId(null);
      toast.success("Sequence deleted");
    } catch { toast.error("Failed to delete"); }
  };

  if (selectedSequenceId) {
    const seq = sequences.find(s => s.id === selectedSequenceId);
    if (seq) return (
      <SequenceDetail
        sequence={seq}
        onBack={() => setSelectedSequenceId(null)}
        onUpdate={updateSequence}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Follow-up Sequences
            </CardTitle>
            <CardDescription>
              Automated email sequences via systeme.io tags. Create sequences, add steps, and assign leads.
            </CardDescription>
          </div>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New Sequence</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Follow-up Sequence</DialogTitle>
                <DialogDescription>Define a new automated email sequence</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Sequence Name</Label>
                  <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Welcome Sequence" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What this sequence does..." />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={newAutoAssign} onCheckedChange={setNewAutoAssign} />
                  <Label>Auto-assign to new leads</Label>
                </div>
                <Button onClick={handleCreate} className="w-full">Create Sequence</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : sequences.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No sequences yet</p>
            <p className="text-sm">Create your first follow-up sequence to automate lead outreach.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sequence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Auto-Assign</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sequences.map(seq => (
                <TableRow key={seq.id} className="cursor-pointer" onClick={() => setSelectedSequenceId(seq.id)}>
                  <TableCell>
                    <div>
                      <div className="font-medium flex items-center gap-1">
                        {seq.name} <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      </div>
                      {seq.description && <div className="text-sm text-muted-foreground">{seq.description}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={seq.is_active ? "default" : "secondary"}>
                      {seq.is_active ? "Active" : "Paused"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {seq.auto_assign_new_leads ? (
                      <Badge variant="outline" className="text-xs">Auto</Badge>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(seq.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" onClick={() => handleToggleActive(seq.id, seq.is_active)}>
                      {seq.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(seq.id)}>
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
  );
};

export default FollowupSequencesManager;
