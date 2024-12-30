import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Plus } from "lucide-react";
import { CreatePostDialog } from "./CreatePostDialog";

type Post = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author: {
    username: string;
    avatar_url: string | null;
  } | null;
};

export const DiscussionBoard = ({ communityId }: { communityId: string }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPosts = async () => {
    const { data: postsData, error } = await supabase
      .from("posts")
      .select(`
        *,
        author:profiles(username, avatar_url)
      `)
      .eq("community_id", communityId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching posts",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setPosts(postsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel("posts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
          filter: `community_id=eq.${communityId}`,
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [communityId]);

  if (loading) {
    return <div>Loading posts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Discussion Board</h2>
        <CreatePostDialog communityId={communityId} />
      </div>
      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No posts yet. Be the first to start a discussion!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Posted by {post.author?.username || "Unknown"} on{" "}
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{post.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};