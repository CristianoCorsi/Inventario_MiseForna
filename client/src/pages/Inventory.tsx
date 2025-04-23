import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AddItemModal from "@/components/inventory/AddItemModal";
import ItemCard from "@/components/inventory/ItemCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon, FileDownIcon, FilterIcon } from "lucide-react";
import { Item } from "@shared/schema";

export default function Inventory() {
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const { data: items, isLoading } = useQuery<Item[]>({
    queryKey: ["/api/items"],
  });

  const { data: locations } = useQuery({
    queryKey: ["/api/locations"]
  });

  // Filter items based on search term and filters
  const filteredItems = items?.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesLocation = locationFilter === "all" || item.location === locationFilter;
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  return (
    <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
      {/* Page Header */}
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
        <div className="mt-3 flex sm:mt-0 sm:ml-4">
          <Button variant="outline" className="mr-3">
            <FileDownIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsAddItemModalOpen(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <Input
            placeholder="Search by name, ID, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-full"
          />
        </div>
        <div>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="loaned">Loaned</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select
            value={locationFilter}
            onValueChange={setLocationFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations?.map((location) => (
                <SelectItem key={location.id} value={location.name}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Items Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white shadow rounded-lg p-4">
              <Skeleton className="h-40 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredItems && filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No items found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {items?.length ? "Try adjusting your filters or search term." : "Add your first inventory item to get started."}
          </p>
          <div className="mt-6">
            <Button onClick={() => setIsAddItemModalOpen(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      <AddItemModal 
        isOpen={isAddItemModalOpen} 
        onClose={() => setIsAddItemModalOpen(false)} 
      />
    </div>
  );
}
