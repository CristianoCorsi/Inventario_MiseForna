import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { itemFormSchema, Item } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ItemFormProps {
  item?: Item;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ItemForm({ item, onSuccess, onCancel }: ItemFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: locations } = useQuery({
    queryKey: ["/api/locations"],
  });
  
  const form = useForm<Item>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      id: item?.id || 0,
      itemId: item?.itemId || "",
      name: item?.name || "",
      description: item?.description || "",
      location: item?.location || "",
      photoUrl: item?.photoUrl || "",
      origin: item?.origin || "purchased",
      donorName: item?.donorName || "",
      status: item?.status || "available",
      qrCode: item?.qrCode || "",
      barcode: item?.barcode || "",
      dateAdded: item?.dateAdded || new Date().toISOString()
    }
  });
  
  const updateItemMutation = useMutation({
    mutationFn: async (data: Item) => {
      return apiRequest("PUT", `/api/items/${data.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Item has been updated successfully."
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update item",
        variant: "destructive"
      });
    }
  });
  
  const onSubmit = (data: Item) => {
    updateItemMutation.mutate(data);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{item ? 'Edit Item' : 'Add New Item'}</CardTitle>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Power Drill XR200" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="itemId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. TOOL-1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter item description..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Storage Location</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations?.map((location) => (
                          <SelectItem key={location.id} value={location.name}>
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {(item?.photoUrl || false) && (
              <div>
                <FormLabel>Current Photo</FormLabel>
                <div className="mt-1 w-full max-w-[200px] h-auto border rounded-md p-2">
                  <img 
                    src={item?.photoUrl} 
                    alt={item?.name} 
                    className="max-w-full h-auto"
                  />
                </div>
              </div>
            )}
            
            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Item Origin</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="purchased" id="origin-purchased" />
                        <Label htmlFor="origin-purchased">Purchased</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="donated" id="origin-donated" />
                        <Label htmlFor="origin-donated">Donated</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="origin-other" />
                        <Label htmlFor="origin-other">Other</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {(form.watch("origin") === "donated" || form.watch("origin") === "other") && (
              <FormField
                control={form.control}
                name="donorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Donor/Source Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter donor or source name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={updateItemMutation.isPending}
            >
              {updateItemMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
