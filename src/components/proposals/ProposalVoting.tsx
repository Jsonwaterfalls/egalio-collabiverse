import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProposalVotingProps {
  proposalId: string;
  currentVote?: string;
}

export const ProposalVoting = ({ proposalId, currentVote }: ProposalVotingProps) => {
  const [loading, setLoading] = useState(false);

  const handleVote = async (voteType: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to vote");
        return;
      }

      if (currentVote) {
        // Update existing vote
        const { error } = await supabase
          .from("proposal_votes")
          .update({ vote_type: voteType })
          .eq("proposal_id", proposalId)
          .eq("voter_id", user.id);

        if (error) throw error;
        toast.success("Vote updated successfully");
      } else {
        // Create new vote
        const { error } = await supabase
          .from("proposal_votes")
          .insert({
            proposal_id: proposalId,
            voter_id: user.id,
            vote_type: voteType,
          });

        if (error) throw error;
        toast.success("Vote recorded successfully");
      }
    } catch (error: any) {
      toast.error("Error recording vote: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleVote("for")}
        disabled={loading}
        className={currentVote === "for" ? "bg-green-100" : ""}
      >
        <ThumbsUp className="h-4 w-4 mr-1" />
        For
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleVote("against")}
        disabled={loading}
        className={currentVote === "against" ? "bg-red-100" : ""}
      >
        <ThumbsDown className="h-4 w-4 mr-1" />
        Against
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleVote("abstain")}
        disabled={loading}
        className={currentVote === "abstain" ? "bg-gray-100" : ""}
      >
        <Minus className="h-4 w-4 mr-1" />
        Abstain
      </Button>
    </div>
  );
};