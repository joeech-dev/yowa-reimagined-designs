import { usePresence } from "@/hooks/usePresence";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Circle, MapPin } from "lucide-react";

const roleColors: Record<string, string> = {
  super_admin: "bg-destructive text-destructive-foreground",
  admin: "bg-primary text-primary-foreground",
  finance: "bg-secondary text-secondary-foreground",
  project_team: "bg-accent text-accent-foreground",
  sales_marketing: "bg-muted text-muted-foreground",
};

const OnlineUsersWidget = () => {
  const onlineUsers = usePresence();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          Team Online
        </CardTitle>
        <Badge variant="outline" className="gap-1">
          <Circle className="h-2 w-2 fill-green-500 text-green-500" />
          {onlineUsers.length}
        </Badge>
      </CardHeader>
      <CardContent>
        {onlineUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No team members online</p>
        ) : (
          <div className="space-y-3">
            {onlineUsers.map((user) => (
              <div key={user.user_id} className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    {(user.display_name || "U")[0].toUpperCase()}
                  </div>
                  <Circle className="h-2.5 w-2.5 fill-green-500 text-green-500 absolute -bottom-0.5 -right-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.display_name || user.email}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${roleColors[user.role || ""] || ""}`}>
                      {user.role?.replace("_", " ") || "user"}
                    </Badge>
                    {(user as any).location && (
                      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <MapPin className="h-2.5 w-2.5" />
                        {(user as any).location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OnlineUsersWidget;
