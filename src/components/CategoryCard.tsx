import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  title: string;
  icon: LucideIcon;
  count: number;
  image: string;
}

const CategoryCard = ({ title, icon: Icon, count, image }: CategoryCardProps) => {
  return (
    <Card className="group hover:shadow-soft transition-all duration-300 cursor-pointer border-border hover:border-primary overflow-hidden relative h-48">
      <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-foreground/60 group-hover:bg-foreground/50 transition-all" />
      <CardContent className="relative h-full p-6 flex flex-col items-center justify-center text-center space-y-3">
        <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform">
          <Icon className="h-8 w-8" />
        </div>
        <h3 className="font-semibold text-primary-foreground">{title}</h3>
        <p className="text-sm text-primary-foreground/90">{count} events</p>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
