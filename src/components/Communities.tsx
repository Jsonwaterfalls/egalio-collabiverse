import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CommunityList } from "./CommunityList";
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
    try {
      const { data: user } = await supabase.auth.getUser();
      
      // First, get all communities
      const { data: communitiesData, error: communitiesError } = await supabase
        .from("communities")
        .select("*");

      if (communitiesError) {
        throw communitiesError;
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
    } catch (error: any) {
      toast({
        title: "Error fetching communities",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeave = async (communityId: string, isJoining: boolean) => {
    try {
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

        if (error) throw error;

        toast({
          title: "Joined community",
          description: "You have successfully joined the community.",
        });
      } else {
        const { error } = await supabase
          .from("community_members")
          .delete()
          .match({ community_id: communityId, profile_id: user.user.id });

        if (error) throw error;

        toast({
          title: "Left community",
          description: "You have successfully left the community.",
        });
      }

      await fetchCommunities();
    } catch (error: any) {
      toast({
        title: `Error ${isJoining ? "joining" : "leaving"} community`,
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCommunities();

    // Subscribe to changes in communities and community members
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
          console.log("Communities changed, refreshing...");
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
          console.log("Community members changed, refreshing...");
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
        <CommunityList
          communities={communities}
          onJoinLeave={handleJoinLeave}
          onSelectCommunity={setSelectedCommunity}
        />
        {selectedCommunity && (
          <div className="mt-8">
            <DiscussionBoard communityId={selectedCommunity} />
          </div>
        )}
      </div>
    </section>
  );
};