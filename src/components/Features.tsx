import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Share2, Brain, Shield } from "lucide-react";

const features = [
  {
    title: "Interest-based Communities",
    description: "Join or create communities based on shared interests and passions",
    icon: Users,
  },
  {
    title: "Resource Sharing",
    description: "Share knowledge, skills, and resources with other members",
    icon: Share2,
  },
  {
    title: "AI Integration",
    description: "Collaborate seamlessly with AI systems on various projects",
    icon: Brain,
  },
  {
    title: "Decentralized & Secure",
    description: "Built on decentralized technology for privacy and security",
    icon: Shield,
  },
];

export const Features = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-egalio-dark">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <feature.icon className="w-10 h-10 text-egalio-purple mb-4" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-500">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};