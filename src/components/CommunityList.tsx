import { CommunityCard } from "./CommunityCard";
import { CreateCommunityDialog } from "./CreateCommunityDialog";

type Community = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  member_count: number;
  is_member: boolean;
};

type CommunityListProps = {
  communities: Community[];
  onJoinLeave: (communityId: string, isJoining: boolean) => Promise<void>;
  onSelectCommunity: (communityId: string) => void;
};

export const CommunityList = ({
  communities,
  onJoinLeave,
  onSelectCommunity,
}: CommunityListProps) => {
  return (
    <>
      <CreateCommunityDialog />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities.map((community) => (
          <CommunityCard
            key={community.id}
            community={community}
            onJoinLeave={onJoinLeave}
            onSelect={onSelectCommunity}
          />
        ))}
      </div>
    </>
  );
};