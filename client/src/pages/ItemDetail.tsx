import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { QRCodeGenerator } from "@/components/inventory/QRCodeGenerator";
import { ItemForm } from "@/components/inventory/ItemForm";
import { LoanForm } from "@/components/loans/LoanForm";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Item, Activity, Loan } from "@shared/schema";
import { format } from "date-fns";
import { ArrowLeftIcon, EditIcon, TrashIcon, PackageIcon, ClockIcon, MapPinIcon, UserIcon } from "lucide-react";

export default function ItemDetail() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoaning, setIsLoaning] = useState(false);
  
  const itemId = parseInt(id);
  
  const { data: item, isLoading: itemLoading } = useQuery<Item>({
    queryKey: [`/api/items/${itemId}`],
    enabled: !isNaN(itemId),
  });
  
  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: [`/api/activities/item/${itemId}`],
    enabled: !isNaN(itemId),
  });
  
  const { data: loans, isLoading: loansLoading } = useQuery<Loan[]>({
    queryKey: [`/api/loans/item/${itemId}`],
    enabled: !isNaN(itemId),
  });
  
  const deleteItemMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/items/${itemId}`);
    },
    onSuccess: () => {
      toast({
        title: "Item deleted",
        description: "The item has been successfully deleted.",
      });
      navigate("/inventory");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete item",
        variant: "destructive"
      });
    }
  });
  
  if (itemLoading) {
    return (
      <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/inventory")}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Inventory
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!item) {
    return (
      <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Item not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The item you are looking for does not exist or has been deleted.
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate("/inventory")}>
              Return to Inventory
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-success/20 text-success';
      case 'loaned':
        return 'bg-primary/20 text-primary';
      case 'maintenance':
        return 'bg-gray-500/20 text-gray-500';
      default:
        return 'bg-muted-foreground/20 text-muted-foreground';
    }
  };
  
  const handleReturnLoan = async (loanId: number) => {
    try {
      await apiRequest("PUT", `/api/loans/${loanId}/return`, { returnDate: new Date() });
      queryClient.invalidateQueries({ queryKey: [`/api/loans/item/${itemId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/items/${itemId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/activities/item/${itemId}`] });
      toast({
        title: "Item returned",
        description: "The loan has been successfully returned.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to return loan",
        variant: "destructive"
      });
    }
  };
  
  // Sort loans to show active/overdue first
  const sortedLoans = [...(loans || [])].sort((a, b) => {
    // Active/overdue first
    if ((a.status === 'active' || a.status === 'overdue') && 
        (b.status !== 'active' && b.status !== 'overdue')) {
      return -1;
    }
    if ((b.status === 'active' || b.status === 'overdue') && 
        (a.status !== 'active' && a.status !== 'overdue')) {
      return 1;
    }
    // Then sort by date (most recent first)
    return new Date(b.loanDate).getTime() - new Date(a.loanDate).getTime();
  });
  
  return (
    <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/inventory")}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Inventory
        </Button>
        
        <div className="flex space-x-2">
          {isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                disabled={item.status === 'loaned'}
              >
                <EditIcon className="h-4 w-4 mr-2" />
                Edit
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive"
                    disabled={item.status === 'loaned'}
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the item
                      <strong> {item.name}</strong> from the inventory.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => deleteItemMutation.mutate()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleteItemMutation.isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <ItemForm 
          item={item} 
          onCancel={() => setIsEditing(false)} 
          onSuccess={() => {
            setIsEditing(false);
            queryClient.invalidateQueries({ queryKey: [`/api/items/${itemId}`] });
          }} 
        />
      ) : isLoaning ? (
        <Card>
          <CardHeader>
            <CardTitle>Loan {item.name}</CardTitle>
            <CardDescription>
              Fill out the form below to loan this item
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoanForm 
              itemId={item.id} 
              onCancel={() => setIsLoaning(false)} 
              onSuccess={() => {
                setIsLoaning(false);
                queryClient.invalidateQueries({ queryKey: [`/api/items/${itemId}`] });
                queryClient.invalidateQueries({ queryKey: [`/api/loans/item/${itemId}`] });
                queryClient.invalidateQueries({ queryKey: [`/api/activities/item/${itemId}`] });
              }} 
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{item.name}</CardTitle>
                    <CardDescription>ID: {item.itemId}</CardDescription>
                  </div>
                  <Badge className={getStatusBadgeClass(item.status)}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  {item.description ? (
                    <p className="text-gray-700">{item.description}</p>
                  ) : (
                    <p className="text-gray-500 italic">No description available</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center">
                    <PackageIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Origin</p>
                      <p className="font-medium">
                        {item.origin.charAt(0).toUpperCase() + item.origin.slice(1)}
                        {item.donorName && ` (${item.donorName})`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Added on</p>
                      <p className="font-medium">
                        {item.dateAdded ? format(new Date(item.dateAdded), 'MMM d, yyyy') : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{item.location || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Tabs for Activities and Loans */}
                <Tabs defaultValue="activities" className="mt-8">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="activities">Activity History</TabsTrigger>
                    <TabsTrigger value="loans">Loan History</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="activities" className="mt-4">
                    {activitiesLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="border rounded-md p-4">
                            <Skeleton className="h-5 w-1/4 mb-2" />
                            <Skeleton className="h-4 w-3/4 mb-1" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        ))}
                      </div>
                    ) : activities && activities.length > 0 ? (
                      <div className="space-y-4">
                        {activities.map((activity) => (
                          <div key={activity.id} className="border rounded-md p-4">
                            <div className="flex items-center justify-between mb-2">
                              <Badge className={`activity-badge-${activity.activityType}`}>
                                {activity.activityType.charAt(0).toUpperCase() + activity.activityType.slice(1)}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
                              </span>
                            </div>
                            <p className="text-gray-700">{activity.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No activity records found for this item.
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="loans" className="mt-4">
                    {loansLoading ? (
                      <div className="space-y-4">
                        {[...Array(2)].map((_, i) => (
                          <div key={i} className="border rounded-md p-4">
                            <Skeleton className="h-5 w-1/4 mb-2" />
                            <Skeleton className="h-4 w-3/4 mb-1" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        ))}
                      </div>
                    ) : sortedLoans && sortedLoans.length > 0 ? (
                      <div className="space-y-4">
                        {sortedLoans.map((loan) => (
                          <div key={loan.id} className="border rounded-md p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <UserIcon className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="font-medium">{loan.borrowerName}</span>
                              </div>
                              <Badge className={
                                loan.status === 'active' ? 'bg-primary/20 text-primary' :
                                loan.status === 'overdue' ? 'bg-destructive/20 text-destructive' :
                                'bg-success/20 text-success'
                              }>
                                {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                              <div>
                                <p className="text-gray-500">Loan Date</p>
                                <p>{format(new Date(loan.loanDate), 'MMM d, yyyy')}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Due Date</p>
                                <p className={loan.status === 'overdue' ? 'text-destructive font-medium' : ''}>
                                  {format(new Date(loan.dueDate), 'MMM d, yyyy')}
                                </p>
                              </div>
                              {loan.returnDate && (
                                <div className="col-span-2">
                                  <p className="text-gray-500">Returned</p>
                                  <p>{format(new Date(loan.returnDate), 'MMM d, yyyy')}</p>
                                </div>
                              )}
                              {loan.notes && (
                                <div className="col-span-2 mt-2">
                                  <p className="text-gray-700">{loan.notes}</p>
                                </div>
                              )}
                            </div>
                            
                            {(loan.status === 'active' || loan.status === 'overdue') && (
                              <div className="mt-4 flex justify-end">
                                <Button 
                                  size="sm"
                                  onClick={() => handleReturnLoan(loan.id)}
                                >
                                  Return Item
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        This item has not been loaned out yet.
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-6">
                {item.status === 'available' ? (
                  <Button 
                    onClick={() => setIsLoaning(true)}
                    size="lg"
                  >
                    Loan this item
                  </Button>
                ) : item.status === 'loaned' ? (
                  <Button 
                    variant="outline" 
                    size="lg"
                    disabled
                  >
                    Currently on loan
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="lg"
                    disabled
                  >
                    Not available for loan
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>QR Code & Barcode</CardTitle>
                <CardDescription>
                  Scan to quickly access this item
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <QRCodeGenerator 
                  itemId={item.itemId} 
                  qrValue={item.qrCode || item.itemId}
                  name={item.name}
                  item={item}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
