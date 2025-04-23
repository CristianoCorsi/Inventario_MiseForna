import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loan, Item } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow, format, isBefore } from "date-fns";
import { isOverdue } from "@/lib/dateUtils";
import { 
  ClockIcon, 
  PackageIcon, 
  UserIcon, 
  CalendarIcon, 
  MailIcon, 
  PhoneIcon,
  CheckCircleIcon,
  AlertTriangleIcon
} from "lucide-react";

interface LoanCardProps {
  loan: Loan;
  item?: Item;
}

export default function LoanCard({ loan, item }: LoanCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  
  // Check if loan is overdue
  const overdueStatus = isOverdue(loan);
  
  const returnLoanMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PUT", `/api/loans/${loan.id}/return`, { 
        returnDate: new Date(),
        condition: "good"
      });
    },
    onSuccess: () => {
      toast({
        title: "Item returned",
        description: "The loan has been successfully returned."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to return loan",
        variant: "destructive"
      });
    }
  });
  
  const handleReturn = () => {
    returnLoanMutation.mutate();
    setOpen(false);
  };
  
  // Format date with relative time
  const formatDate = (date: string | Date) => {
    const dateObj = new Date(date);
    return {
      formatted: format(dateObj, "MMM d, yyyy"),
      relative: formatDistanceToNow(dateObj, { addSuffix: true })
    };
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {item?.name || "Unknown Item"}
            </h3>
            <Badge className={
              loan.status === "active" ? "bg-blue-100 text-blue-800 ml-2" :
              loan.status === "overdue" ? "bg-red-100 text-red-800 ml-2" :
              "bg-green-100 text-green-800 ml-2"
            }>
              {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
            </Badge>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            ID: {item?.itemId || `Item #${loan.itemId}`}
          </p>
        </div>
        
        {(loan.status === "active" || loan.status === "overdue") && (
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button size="sm">
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Return
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Return Item</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to mark this item as returned? This will update the item status to 'available'.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReturn}>
                  {returnLoanMutation.isPending ? "Processing..." : "Confirm Return"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
          <div className="sm:col-span-1">
            <div className="flex items-center">
              <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
              <dt className="text-sm font-medium text-gray-500">Borrower</dt>
            </div>
            <dd className="mt-1 text-sm text-gray-900 ml-7">{loan.borrowerName}</dd>
          </div>
          
          <div className="sm:col-span-1">
            <div className="flex items-center">
              <PackageIcon className="h-5 w-5 text-gray-400 mr-2" />
              <dt className="text-sm font-medium text-gray-500">Location</dt>
            </div>
            <dd className="mt-1 text-sm text-gray-900 ml-7">{item?.location || "Unknown"}</dd>
          </div>
          
          {loan.borrowerEmail && (
            <div className="sm:col-span-1">
              <div className="flex items-center">
                <MailIcon className="h-5 w-5 text-gray-400 mr-2" />
                <dt className="text-sm font-medium text-gray-500">Email</dt>
              </div>
              <dd className="mt-1 text-sm text-gray-900 ml-7">{loan.borrowerEmail}</dd>
            </div>
          )}
          
          {loan.borrowerPhone && (
            <div className="sm:col-span-1">
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
              </div>
              <dd className="mt-1 text-sm text-gray-900 ml-7">{loan.borrowerPhone}</dd>
            </div>
          )}
          
          <div className="sm:col-span-1">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <dt className="text-sm font-medium text-gray-500">Loan Date</dt>
            </div>
            <dd className="mt-1 text-sm text-gray-900 ml-7">
              {formatDate(loan.loanDate).formatted}
              <span className="block text-xs text-gray-500">
                {formatDate(loan.loanDate).relative}
              </span>
            </dd>
          </div>
          
          <div className="sm:col-span-1">
            <div className="flex items-center">
              <ClockIcon className={`h-5 w-5 mr-2 ${overdueStatus ? "text-red-500" : "text-gray-400"}`} />
              <dt className={`text-sm font-medium ${overdueStatus ? "text-red-500" : "text-gray-500"}`}>
                {loan.status === "returned" ? "Return Date" : "Due Date"}
              </dt>
            </div>
            <dd className={`mt-1 text-sm ml-7 ${overdueStatus ? "text-red-600 font-medium" : "text-gray-900"}`}>
              {loan.status === "returned" && loan.returnDate
                ? formatDate(loan.returnDate).formatted
                : formatDate(loan.dueDate).formatted
              }
              <span className={`block text-xs ${overdueStatus ? "text-red-500" : "text-gray-500"}`}>
                {loan.status === "returned" && loan.returnDate
                  ? formatDate(loan.returnDate).relative
                  : formatDate(loan.dueDate).relative
                }
                {overdueStatus && (
                  <span className="inline-flex items-center ml-1">
                    <AlertTriangleIcon className="h-3 w-3 text-red-500 mr-1" />
                    Overdue
                  </span>
                )}
              </span>
            </dd>
          </div>
          
          {loan.notes && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 text-sm text-gray-900">{loan.notes}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
