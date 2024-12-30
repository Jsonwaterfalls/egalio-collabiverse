import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Edit, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ResourceRating } from "./ResourceRating";

interface ResourceCardProps {
  resource: {
    id: string;
    title: string;
    description: string;
    type: string;
    price: number;
    author_id: string;
  };
  onDelete: (id: string) => void;
  isOwner: boolean;
}

export const ResourceCard = ({ resource, onDelete, isOwner }: ResourceCardProps) => {
  const [loading, setLoading] = useState(false);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);
  const { toast } = useToast();

  const loadRatings = async () => {
    try {
      const { data: ratings, error } = await supabase
        .from("resource_ratings")
        .select("rating")
        .eq("resource_id", resource.id);

      if (error) throw error;

      if (ratings && ratings.length > 0) {
        const total = ratings.reduce((sum, r) => sum + (r.rating || 0), 0);
        setAverageRating(total / ratings.length);
        setRatingCount(ratings.length);
      }
    } catch (error: any) {
      console.error("Error loading ratings:", error.message);
    }
  };

  useEffect(() => {
    loadRatings();
  }, [resource.id]);

  const handleDelete = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("resources")
        .delete()
        .eq("id", resource.id);

      if (error) throw error;

      onDelete(resource.id);
      toast({
        title: "Resource deleted",
        description: "The resource has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{resource.title}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {resource.type}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{resource.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className={`h-4 w-4 ${averageRating ? "text-yellow-400" : "text-gray-300"}`} />
            <span className="text-sm">
              {averageRating 
                ? `${averageRating.toFixed(1)} (${ratingCount} ${ratingCount === 1 ? "rating" : "ratings"})`
                : "No ratings yet"}
            </span>
          </div>
          <span className="text-sm font-medium">
            {resource.price === 0 ? "Free" : `$${resource.price}`}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {!isOwner && (
          <ResourceRating resourceId={resource.id} onRatingSubmitted={loadRatings} />
        )}
        {isOwner && (
          <>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};