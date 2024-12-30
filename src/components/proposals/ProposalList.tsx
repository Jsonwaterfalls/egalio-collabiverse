import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateProposalDialog } from "./CreateProposalDialog";
import { ProposalVoting } from "./ProposalVoting";
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

type Vote = {
  vote_type: string;
};

export const ProposalList = ({ communityId }: { communityId: string }) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});

  const fetchProposals = async () => {
    try {
      const { data, error } = await supabase
        .from("proposals")
        .select("*")
        .eq("community_id", communityId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProposals(data || []);

      // Fetch user's votes
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: votes, error: votesError } = await supabase
          .from("proposal_votes")
          .select("proposal_id, vote_type")
          .eq("voter_id", user.id);

        if (votesError) throw votesError;
        const votesMap = (votes || []).reduce((acc: Record<string, string>, vote: any) => {
          acc[vote.proposal_id] = vote.vote_type;
          return acc;
        }, {});
        setUserVotes(votesMap);
      }
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

    // Subscribe to vote changes
    const votesChannel = supabase
      .channel("votes-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "proposal_votes",
        },
        () => {
          console.log("Votes changed, refreshing...");
          fetchProposals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(votesChannel);
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
              <div className="text-sm text-muted-foreground mb-4">
                Votes required: {proposal.votes_required}
              </div>
              <ProposalVoting
                proposalId={proposal.id}
                currentVote={userVotes[proposal.id]}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};