import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { DiscussionBoard } from "@/components/DiscussionBoard";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Community = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  member_count: number;
  is_member: boolean;
};

const CommunityPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCommunity = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data: communityData, error: communityError } = await supabase
        .from("communities")
        .select("*")
        .eq("id", id)
        .single();

      if (communityError) throw communityError;

      const { data: members } = await supabase
        .from("community_members")
        .select("profile_id")
        .eq("community_id", id);

      const communityWithMembers = {
        ...communityData,
        member_count: members?.length || 0,
        is_member: members?.some(
          (member) => member.profile_id === user.user?.id
        ) || false,
      };

      setCommunity(communityWithMembers);
    } catch (error: any) {
      toast({
        title: "Error fetching community",
        description: error.message,
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunity();

    const channel = supabase
      .channel("community-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "communities",
          filter: `id=eq.${id}`,
        },
        () => {
          fetchCommunity();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "community_members",
          filter: `community_id=eq.${id}`,
        },
        () => {
          fetchCommunity();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (loading) {
    return <div>Loading community...</div>;
  }

  if (!community) {
    return <div>Community not found</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container px-4 md:px-6 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Communities
        </Button>
        
        <div
          className="h-48 bg-cover bg-center rounded-lg mb-6"
          style={{
            backgroundImage: `url(${
              community.image_url ||
              "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1"
            })`,
          }}
        />

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{community.name}</h1>
            <p className="text-zinc-600 mt-2">{community.description}</p>
            <p className="text-sm text-zinc-500 mt-1">
              {community.member_count} members
            </p>
          </div>

          <DiscussionBoard communityId={community.id} />
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;