import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeamMember {
  id: string;
  full_name: string;
  role: string;
  category: string;
  avatar_url: string | null;
  linkedin_url: string | null;
  display_order: number;
}

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const TeamMemberCard = ({ member, size }: { member: TeamMember; size: "lg" | "md" | "sm" }) => {
  const avatarSize = size === "lg" ? "h-32 w-32" : size === "md" ? "h-20 w-20" : "h-14 w-14";
  const nameSize = size === "lg" ? "text-lg font-semibold" : size === "md" ? "text-base font-medium" : "text-sm font-medium";
  const roleSize = size === "lg" ? "text-sm" : "text-xs";

  return (
    <Card className="p-6 text-center hover:shadow-warm transition-smooth group">
      <Avatar className={`${avatarSize} mx-auto mb-3`}>
        <AvatarImage src={member.avatar_url || ""} alt={member.full_name} className="object-cover" />
        <AvatarFallback className={size === "sm" ? "text-xs" : "text-base"}>
          {getInitials(member.full_name)}
        </AvatarFallback>
      </Avatar>
      <h3 className={`font-display ${nameSize}`}>{member.full_name}</h3>
      <p className={`text-muted-foreground ${roleSize} mb-2`}>{member.role}</p>
      {member.linkedin_url && (
        <Button variant="outline" size="sm" asChild className="gap-1.5">
          <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer">
            <Linkedin className="h-3.5 w-3.5" /> LinkedIn
          </a>
        </Button>
      )}
    </Card>
  );
};

const SupportingTeam = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase
        .from("team_members")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      setMembers((data as TeamMember[]) || []);
      setLoading(false);
    };
    fetchMembers();
  }, []);

  const employees = members.filter((m) => m.category === "employee");
  const freelancers = members.filter((m) => m.category === "freelancer");
  const trainees = members.filter((m) => m.category === "trainee");

  return (
    <div className="min-h-screen">
      <SEO
        title="Supporting Team | Yowa Innovations"
        description="Meet the extended Yowa Innovations team — employees, freelancers, and trainees powering our creative work."
        url="https://yowainnovations.com/team"
      />
      <Navbar />

      <section className="pt-32 pb-16 gradient-subtle">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display font-bold text-5xl md:text-6xl mb-4">Supporting Team</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The talented individuals who bring our creative vision to life.
          </p>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      ) : (
        <>
          {/* Employees */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <h2 className="font-display font-bold text-3xl mb-10 text-center">Employees</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
                {employees.length > 0 ? employees.map((m) => (
                  <TeamMemberCard key={m.id} member={m} size="lg" />
                )) : (
                  <p className="col-span-full text-center text-muted-foreground">No employees listed yet.</p>
                )}
              </div>
            </div>
          </section>

          {/* Freelancers */}
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="font-display font-bold text-3xl mb-10 text-center">Freelancers</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {freelancers.length > 0 ? freelancers.map((m) => (
                  <TeamMemberCard key={m.id} member={m} size="md" />
                )) : (
                  <p className="col-span-full text-center text-muted-foreground">No freelancers listed yet.</p>
                )}
              </div>
            </div>
          </section>

          {/* Trainees */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <h2 className="font-display font-bold text-3xl mb-10 text-center">Trainees</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
                {trainees.length > 0 ? trainees.map((m) => (
                  <TeamMemberCard key={m.id} member={m} size="sm" />
                )) : (
                  <p className="col-span-full text-center text-muted-foreground">No trainees listed yet.</p>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
};

export default SupportingTeam;
