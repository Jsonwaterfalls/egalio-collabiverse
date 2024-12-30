import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ProposalVoting } from "./ProposalVoting";
import { ProposalComments } from "./ProposalComments";

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

export const ProposalCard = ({ 
  proposal,
  currentVote,
}: { 
  proposal: Proposal;
  currentVote?: string;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{proposal.title}</CardTitle>
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Status: {proposal.status}</span>
          <span>
            Deadline: {format(new Date(proposal.deadline), "PPP")}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          {proposal.description}
        </p>
        <div className="text-sm text-muted-foreground">
          Votes required: {proposal.votes_required}
        </div>
        <ProposalVoting
          proposalId={proposal.id}
          currentVote={currentVote}
        />
        <ProposalComments proposalId={proposal.id} />
      </CardContent>
    </Card>
  );
};