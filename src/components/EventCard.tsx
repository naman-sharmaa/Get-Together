import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  // If already a full URL (http:// or https://), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If image starts with /uploads, it's an uploaded file - prepend backend base URL (without /api)
  if (imagePath.startsWith('/uploads')) {
    const baseUrl = API_BASE_URL.replace('/api', '');
    const fullUrl = `${baseUrl}${imagePath}`;
    console.log('🖼️ Image URL:', { imagePath, baseUrl, fullUrl });
    return fullUrl;
  }
  
  // Otherwise return as-is (relative path or asset)
  return imagePath;
};

interface EventCardProps {
  id?: string;
  title: string;
  date: string;
  location: string;
  image: string;
  category: string;
  price?: string;
  bookingExpiry?: string;
}

const EventCard = ({ id, title, date, location, image, category, price, bookingExpiry }: EventCardProps) => {
  const navigate = useNavigate();
  const isBookingClosed = bookingExpiry && new Date(bookingExpiry) < new Date();
  
  const handleClick = () => {
    if (id) {
      navigate(`/event/${id}`);
    }
  };
  
  return (
    <Card 
      className="group overflow-hidden border-border hover:shadow-elevated transition-all duration-300 cursor-pointer flex-shrink-0 w-[300px]"
      onClick={handleClick}
    >
      <div className="aspect-video overflow-hidden">
        <img
          src={getImageUrl(image)}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
          {price && (
            <span className="text-sm font-semibold text-primary">{price}</span>
          )}
        </div>
        <h3 className="font-semibold text-lg line-clamp-1 text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        <div className="space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{location}</span>
          </div>
          {bookingExpiry && (
            <div className={`flex items-center gap-2 pt-2 px-2 py-1 rounded text-xs font-medium ${
              isBookingClosed 
                ? 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400' 
                : 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
            }`}>
              <Calendar className="h-3 w-3" />
              <span>
                {isBookingClosed ? 'Booking Closed' : `Closes: ${new Date(bookingExpiry).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
