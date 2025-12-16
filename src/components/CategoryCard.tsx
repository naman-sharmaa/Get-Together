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
    <Card className="group transition-all duration-300 cursor-pointer border-transparent hover:border-purple-500/40 overflow-hidden relative h-48 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
      <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover brightness-90 group-hover:brightness-110 transition-all" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70 group-hover:from-black/40 group-hover:via-black/30 group-hover:to-black/60 transition-all" />
      <CardContent className="relative h-full p-6 flex flex-col justify-end">
        <h3 className="font-semibold text-primary-foreground text-lg">{title}</h3>
        <p className="text-sm text-primary-foreground/90">{count} events</p>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
