import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreateCommunityDialog } from "./CreateCommunityDialog";
import { UserPlus, UserMinus } from "lucide-react";
import { DiscussionBoard } from "./DiscussionBoard";

type Community = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  member_count: number;
  is_member: boolean;
};

export const Communities = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCommunities = async () => {
    const { data: user } = await supabase.auth.getUser();
    
    // First, get all communities
    const { data: communitiesData, error: communitiesError } = await supabase
      .from("communities")
      .select("*");

    if (communitiesError) {
      toast({
        title: "Error fetching communities",
        description: communitiesError.message,
        variant: "destructive",
      });
      return;
    }

    // Then, for each community, get its members
    const communitiesWithMembers = await Promise.all(
      communitiesData.map(async (community) => {
        const { data: members } = await supabase
          .from("community_members")
          .select("profile_id")
          .eq("community_id", community.id);

        return {
          ...community,
          member_count: members?.length || 0,
          is_member: members?.some(
            (member) => member.profile_id === user.user?.id
          ) || false,
        };
      })
    );

    setCommunities(communitiesWithMembers);
    setLoading(false);
  };

  const handleJoinLeave = async (communityId: string, isJoining: boolean) => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join communities",
        variant: "destructive",
      });
      return;
    }

    if (isJoining) {
      const { error } = await supabase
        .from("community_members")
        .insert({ community_id: communityId, profile_id: user.user.id });

      if (error) {
        toast({
          title: "Error joining community",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Joined community",
        description: "You have successfully joined the community.",
      });
    } else {
      const { error } = await supabase
        .from("community_members")
        .delete()
        .match({ community_id: communityId, profile_id: user.user.id });

      if (error) {
        toast({
          title: "Error leaving community",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Left community",
        description: "You have successfully left the community.",
      });
    }

    fetchCommunities();
  };

  useEffect(() => {
    fetchCommunities();

    const channel = supabase
      .channel("communities-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "communities",
        },
        () => {
          fetchCommunities();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "community_members",
        },
        () => {
          fetchCommunities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return <div>Loading communities...</div>;
  }

  return (
    <section className="py-16 bg-egalio-light">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-egalio-dark">
          Communities
        </h2>
        <CreateCommunityDialog />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <Card
              key={community.id}
              className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedCommunity(community.id)}
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
                    handleJoinLeave(community.id, !community.is_member);
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
          ))}
        </div>
        {selectedCommunity && (
          <div className="mt-8">
            <DiscussionBoard communityId={selectedCommunity} />
          </div>
        )}
      </div>
    </section>
  );
};
