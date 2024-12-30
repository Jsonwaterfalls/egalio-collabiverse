import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const communities = [
  {
    name: "Climate Action",
    members: 1234,
    tags: ["Environment", "Sustainability"],
    image: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1",
  },
  {
    name: "Tech for Good",
    members: 856,
    tags: ["Technology", "Social Impact"],
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  },
  {
    name: "Digital Rights",
    members: 654,
    tags: ["Privacy", "Security"],
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31",
  },
];

export const Communities = () => {
  return (
    <section className="py-16 bg-egalio-light">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-egalio-dark">
          Featured Communities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow">
              <div
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${community.image})` }}
              />
              <CardHeader>
                <CardTitle className="text-xl">{community.name}</CardTitle>
                <div className="flex items-center text-sm text-zinc-500">
                  {community.members} members
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {community.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-egalio-purple/10 text-egalio-purple"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};