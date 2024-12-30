import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateProposalDialog } from "./CreateProposalDialog";
import { format } from "date-fns";
import { toast } from "sonner";

type Proposal = {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  deadline: string;
  votes_required: number;
  created_by: string;
};

export const ProposalList = ({ communityId }: { communityId: string }) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProposals = async () => {
    try {
      const { data, error } = await supabase
        .from("proposals")
        .select("*")
        .eq("community_id", communityId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProposals(data || []);
    } catch (error: any) {
      toast.error("Error fetching proposals");
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();

    // Subscribe to changes
    const channel = supabase
      .channel("proposals-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "proposals",
          filter: `community_id=eq.${communityId}`,
        },
        () => {
          console.log("Proposals changed, refreshing...");
          fetchProposals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [communityId]);

  if (loading) {
    return <div>Loading proposals...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Proposals</h2>
        <CreateProposalDialog communityId={communityId} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {proposals.map((proposal) => (
          <Card key={proposal.id}>
            <CardHeader>
              <CardTitle>{proposal.title}</CardTitle>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Status: {proposal.status}</span>
                <span>
                  Deadline: {format(new Date(proposal.deadline), "PPP")}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {proposal.description}
              </p>
              <div className="text-sm text-muted-foreground">
                Votes required: {proposal.votes_required}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};