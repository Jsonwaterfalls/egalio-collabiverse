import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ResourceCard } from "./ResourceCard";
import { CreateResourceDialog } from "./CreateResourceDialog";
import { ResourceFilters } from "./ResourceFilters";

export const ResourceList = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const { toast } = useToast();

  const loadResources = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      let query = supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply filters
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (selectedType !== "all") {
        query = query.eq("type", selectedType);
      }

      if (priceRange === "free") {
        query = query.eq("price", 0);
      } else if (priceRange === "paid") {
        query = query.gt("price", 0);
      }

      const { data, error } = await query;

      if (error) throw error;
      setResources(data || []);
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

  useEffect(() => {
    loadResources();
  }, [searchQuery, selectedType, priceRange]);

  useEffect(() => {
    const channel = supabase
      .channel("resource-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "resources" },
        () => {
          loadResources();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = (id: string) => {
    setResources(resources.filter((resource) => resource.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Resources</h2>
        <CreateResourceDialog onResourceCreated={loadResources} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ResourceFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
          />
        </div>
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onDelete={handleDelete}
                isOwner={userId === resource.author_id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};