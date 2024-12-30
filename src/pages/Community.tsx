import { useParams } from "react-router-dom";
import { DiscussionBoard } from "@/components/DiscussionBoard";
import { ProposalList } from "@/components/proposals/ProposalList";

const CommunityPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>Community not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <DiscussionBoard communityId={id} />
      <ProposalList communityId={id} />
    </div>
  );
};

export default CommunityPage;