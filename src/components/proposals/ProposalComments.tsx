import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

type Comment = {
  id: string;
  content: string;
  created_at: string;
  author: {
    username: string;
    avatar_url: string | null;
  } | null;
};

export const ProposalComments = ({ proposalId }: { proposalId: string }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("proposal_comments")
      .select(`
        *,
        author:profiles(username, avatar_url)
      `)
      .eq("proposal_id", proposalId)
      .order("created_at", { ascending: true });

    if (error) {
      toast({
        title: "Error fetching comments",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setComments(data || []);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to comment",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("proposal_comments").insert({
      proposal_id: proposalId,
      author_id: user.id,
      content: newComment.trim(),
    });

    if (error) {
      toast({
        title: "Error posting comment",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setNewComment("");
      fetchComments();
      toast({
        title: "Comment posted",
        description: "Your comment has been added to the discussion.",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();

    const channel = supabase
      .channel("comments-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "proposal_comments",
          filter: `proposal_id=eq.${proposalId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [proposalId]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Discussion</h3>
      
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4 p-4 border rounded-lg">
            <Avatar>
              <AvatarImage src={comment.author?.avatar_url || undefined} />
              <AvatarFallback>
                {comment.author?.username?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="font-medium">{comment.author?.username || "Unknown"}</p>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(comment.created_at), "PPp")}
                </span>
              </div>
              <p className="mt-1 text-sm">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="Add to the discussion..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button 
          onClick={handleSubmitComment} 
          disabled={loading || !newComment.trim()}
        >
          Post Comment
        </Button>
      </div>
    </div>
  );
};