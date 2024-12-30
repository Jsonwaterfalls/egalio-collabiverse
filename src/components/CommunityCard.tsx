import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus } from "lucide-react";

type CommunityCardProps = {
  community: {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    member_count: number;
    is_member: boolean;
  };
  onJoinLeave: (communityId: string, isJoining: boolean) => Promise<void>;
  onSelect: (communityId: string) => void;
};

export const CommunityCard = ({ community, onJoinLeave, onSelect }: CommunityCardProps) => {
  return (
    <Card
      key={community.id}
      className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
      onClick={() => onSelect(community.id)}
    >
      <div
        className="h-48 bg-cover bg-center"
        style={{
          backgroundImage: `url(${
            community.image_url ||
            "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1"
          })`,
        }}
      />
      <CardHeader>
        <CardTitle className="text-xl">{community.name}</CardTitle>
        <div className="flex items-center text-sm text-zinc-500">
          {community.member_count} members
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-zinc-600">{community.description}</p>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onJoinLeave(community.id, !community.is_member);
          }}
          variant={community.is_member ? "destructive" : "default"}
          className="w-full"
        >
          {community.is_member ? (
            <>
              <UserMinus className="mr-2 h-4 w-4" />
              Leave Community
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Join Community
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};