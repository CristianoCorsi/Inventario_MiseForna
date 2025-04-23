import { Link } from "wouter";
import { Item } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { format } from "date-fns";
import { PackageIcon, MapPinIcon, CalendarIcon } from "lucide-react";

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'available':
        return 'status-badge-available';
      case 'loaned':
        return 'status-badge-loaned';
      case 'maintenance':
        return 'status-badge-maintenance';
      default:
        return 'bg-muted-foreground/20 text-muted-foreground';
    }
  };
  
  return (
    <Link href={`/inventory/${item.id}`}>
      <Card className="cursor-pointer hover:shadow-md transition-all h-full flex flex-col">
        <div className="relative">
          {item.photoUrl ? (
            <img 
              src={item.photoUrl} 
              alt={item.name} 
              className="w-full h-40 object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded-t-lg">
              <PackageIcon className="h-12 w-12 text-gray-300" />
            </div>
          )}
          <Badge 
            className={`absolute top-2 right-2 ${getStatusBadgeClass(item.status)}`}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Badge>
        </div>
        
        <CardContent className="py-4 flex-grow">
          <h3 className="font-medium text-lg line-clamp-1">{item.name}</h3>
          <p className="text-sm text-gray-500 mb-2">ID: {item.itemId}</p>
          
          {item.description && (
            <p className="text-sm text-gray-700 line-clamp-2 min-h-[40px]">
              {item.description}
            </p>
          )}
        </CardContent>
        
        <CardFooter className="pt-0 pb-4 border-t flex flex-col items-start space-y-1">
          <div className="flex items-center text-sm text-gray-500">
            <MapPinIcon className="h-4 w-4 mr-1" />
            <span>{item.location || "No location specified"}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>Added {item.dateAdded ? format(new Date(item.dateAdded), 'MMM d, yyyy') : "recently"}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
