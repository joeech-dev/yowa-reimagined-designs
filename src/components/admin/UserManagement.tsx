import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Users, Shield, UserPlus, Trash2, Linkedin, Camera, Pencil } from "lucide-react";

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  role: string | null;
  show_on_team_board: boolean;
  linkedin_url: string | null;
  position: string | null;
  avatar_url: string | null;
  team_board_order: number;
}

const ROLE_OPTIONS = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "finance", label: "Finance" },
  { value: "project_team", label: "Project Team" },
  { value: "sales_marketing", label: "Sales & Marketing" },
];

const roleBadgeVariant = (role: string | null) => {
  switch (role) {
    case "super_admin": return "destructive";
    case "admin": return "default";
    case "finance": return "secondary";
    default: return "outline";
  }
};

const getInitials = (email: string, name?: string | null) => {
  if (name) return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  return email.substring(0, 2).toUpperCase();
};

const UserManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newTeamCategory, setNewTeamCategory] = useState("");
  const [newTeamRole, setNewTeamRole] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [editingTeamInfo, setEditingTeamInfo] = useState<string | null>(null);
  const [linkedinValue, setLinkedinValue] = useState("");
  const [positionValue, setPositionValue] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const avatarTargetUser = useRef<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke("list-users", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;
      setUsers(data.users || []);
    } catch (error: any) {
      toast.error("Failed to load users: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingUser(userId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.functions.invoke("assign-role", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { userId, role: newRole },
      });

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      toast.success("Role updated successfully");
    } catch (error: any) {
      toast.error("Failed to update role: " + error.message);
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleToggleTeamBoard = async (userId: string, checked: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ show_on_team_board: checked })
        .eq("user_id", userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, show_on_team_board: checked } : u))
      );
      toast.success(checked ? "Added to team board" : "Removed from team board");
    } catch (error: any) {
      toast.error("Failed to update: " + error.message);
    }
  };

  const handleSaveTeamInfo = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ linkedin_url: linkedinValue || null, position: positionValue || null })
        .eq("user_id", userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, linkedin_url: linkedinValue || null, position: positionValue || null } : u))
      );
      setEditingTeamInfo(null);
      toast.success("Team info updated");
    } catch (error: any) {
      toast.error("Failed to update: " + error.message);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const userId = avatarTargetUser.current;
    if (!file || !userId) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    setUploadingAvatar(userId);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${userId}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Add cache-busting param
      const freshUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: freshUrl })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, avatar_url: freshUrl } : u))
      );
      toast.success("Profile photo updated!");
    } catch (error: any) {
      toast.error("Upload failed: " + error.message);
    } finally {
      setUploadingAvatar(null);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const triggerAvatarUpload = (userId: string) => {
    avatarTargetUser.current = userId;
    avatarInputRef.current?.click();
  };

  const handleCreateUser = async () => {
    if (!newEmail || !newPassword || !newRole) {
      toast.error("Please fill in all fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke("create-user", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { 
          email: newEmail, 
          password: newPassword, 
          role: newRole,
          fullName: newFullName,
          teamCategory: newTeamCategory || null,
          teamRole: newTeamRole || null,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("User created successfully");
      setDialogOpen(false);
      setNewEmail("");
      setNewPassword("");
      setNewRole("");
      setNewFullName("");
      setNewTeamCategory("");
      setNewTeamRole("");
      fetchUsers();
    } catch (error: any) {
      toast.error("Failed to create user: " + error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setDeletingUser(userId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke("create-user", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { action: "delete", userId },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error("Failed to delete user: " + error.message);
    } finally {
      setDeletingUser(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hidden file input for avatar uploads */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarUpload}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-8 w-8" /> User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts and assign roles to control access.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account with a role assignment.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-email">Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-fullname">Full Name</Label>
                <Input
                  id="new-fullname"
                  placeholder="John Doe"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Team Category (optional - shows on website)</Label>
                <Select value={newTeamCategory} onValueChange={setNewTeamCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Not on website team..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                    <SelectItem value="trainee">Trainee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newTeamCategory && (
                <div className="space-y-2">
                  <Label htmlFor="new-team-role">Team Role/Title</Label>
                  <Input
                    id="new-team-role"
                    placeholder="e.g. Videographer"
                    value={newTeamRole}
                    onChange={(e) => setNewTeamRole(e.target.value)}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateUser} disabled={creating}>
                {creating ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Registered Users
          </CardTitle>
          <CardDescription>
            Assign roles and manage who appears on the About page team board.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Team Board</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Assign Role</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    {user.role ? (
                      <Badge variant={roleBadgeVariant(user.role)}>
                        {ROLE_OPTIONS.find((r) => r.value === user.role)?.label || user.role}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">No role</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={user.show_on_team_board}
                        onCheckedChange={(checked) =>
                          handleToggleTeamBoard(user.id, checked as boolean)
                        }
                      />
                      {user.show_on_team_board && (
                        <div className="flex items-start gap-3">
                          {/* Avatar with edit overlay */}
                          <div
                            className="relative cursor-pointer group shrink-0"
                            onClick={() => triggerAvatarUpload(user.id)}
                          >
                            <Avatar className="h-10 w-10 border border-border">
                              <AvatarImage src={user.avatar_url || undefined} />
                              <AvatarFallback className="text-xs bg-primary/10">
                                {getInitials(user.email, user.position)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              {uploadingAvatar === user.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                              ) : (
                                <Camera className="h-4 w-4 text-white" />
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            {editingTeamInfo === user.id ? (
                              <div className="flex flex-col gap-1.5">
                                <Input
                                  className="h-7 w-48 text-xs"
                                  placeholder="Position / Title"
                                  value={positionValue}
                                  onChange={(e) => setPositionValue(e.target.value)}
                                />
                                <Input
                                  className="h-7 w-48 text-xs"
                                  placeholder="LinkedIn URL"
                                  value={linkedinValue}
                                  onChange={(e) => setLinkedinValue(e.target.value)}
                                />
                                <div className="flex gap-1">
                                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => handleSaveTeamInfo(user.id)}>
                                    Save
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setEditingTeamInfo(null)}>
                                    ✕
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs gap-1"
                                onClick={() => {
                                  setEditingTeamInfo(user.id);
                                  setLinkedinValue(user.linkedin_url || "");
                                  setPositionValue(user.position || "");
                                }}
                              >
                                <Pencil className="h-3 w-3" />
                                {user.position || user.linkedin_url ? "Edit Info" : "Add Info"}
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                    <TableCell>
                      <Select
                        value={user.role || ""}
                        onValueChange={(value) => handleRoleChange(user.id, value)}
                        disabled={updatingUser === user.id}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select role..." />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={deletingUser === user.id}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {user.email}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
