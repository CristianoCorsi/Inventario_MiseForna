import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
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
import { useLocation } from "wouter";
import { Loan, Item } from "@shared/schema";
import { PlusIcon, FileDownIcon, ClockIcon } from "lucide-react";
import LoanCard from "@/components/loans/LoanCard";
import { isOverdue } from "@/lib/dateUtils";

export default function Loans() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [location] = useLocation();
  const isOverdueFilter = location.includes("filter=overdue");
  const isBatchMode = location.includes("batch=true");
  
  // If overdue filter is in URL, set statusFilter to "overdue"
  useState(() => {
    if (isOverdueFilter) {
      setStatusFilter("overdue");
    }
  });
  
  const { data: loans, isLoading: loansLoading } = useQuery<Loan[]>({
    queryKey: [statusFilter === "overdue" ? "/api/loans/overdue" : 
              statusFilter === "active" ? "/api/loans/active" : 
              "/api/loans"],
  });
  
  const { data: items } = useQuery<Item[]>({
    queryKey: ["/api/items"],
  });
  
  // Filter loans
  const filteredLoans = loans?.filter(loan => {
    if (!loan) return false;
    
    // Get item for additional filtering
    const item = items?.find(i => i.id === loan.itemId);
    
    const matchesSearch = 
      (item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (item?.itemId?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (loan.borrowerEmail && loan.borrowerEmail.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "overdue" && loan.status === "overdue") ||
      (statusFilter === "active" && loan.status === "active") ||
      (statusFilter === "returned" && loan.status === "returned");
    
    return matchesSearch && matchesStatus;
  });
  
  // Count overdue items for badge
  const overdueCount = loans?.filter(loan => loan.status === "overdue").length || 0;
  
  return (
    <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
      {/* Page Header */}
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Loans</h1>
        <div className="mt-3 flex sm:mt-0 sm:ml-4">
          <Button variant="outline" className="mr-3">
            <FileDownIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Loan
          </Button>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue={isBatchMode ? "batch" : "browse"} className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse Loans</TabsTrigger>
          <TabsTrigger value="batch">Batch Processing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="browse">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Manage Loans</CardTitle>
                  <CardDescription>
                    View and manage all loans in the system
                  </CardDescription>
                </div>
                
                <div className="flex items-center">
                  <Button 
                    variant={statusFilter === "overdue" ? "destructive" : "outline"} 
                    size="sm"
                    onClick={() => setStatusFilter(prev => prev === "overdue" ? "all" : "overdue")}
                    className="flex items-center gap-2"
                  >
                    <ClockIcon className="h-4 w-4" />
                    Overdue
                    {overdueCount > 0 && (
                      <span className="ml-1 text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full">
                        {overdueCount}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Input
                    placeholder="Search by borrower name, item name, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                      <SelectItem value="all">All Loans</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Loans List */}
              {loansLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="bg-white border rounded-lg p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-1" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ))}
                </div>
              ) : filteredLoans && filteredLoans.length > 0 ? (
                <div className="space-y-4">
                  {filteredLoans.map(loan => (
                    <LoanCard 
                      key={loan.id} 
                      loan={loan} 
                      item={items?.find(item => item.id === loan.itemId)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900">No loans found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {loans?.length ? "Try adjusting your filters or search term." : "No loans have been created yet."}
                  </p>
                  <div className="mt-6">
                    <Button>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create Loan
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="batch">
          <Card>
            <CardHeader>
              <CardTitle>Batch Processing</CardTitle>
              <CardDescription>
                Process multiple loans or returns at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="loan">
                <TabsList className="mb-6">
                  <TabsTrigger value="loan">Batch Loan</TabsTrigger>
                  <TabsTrigger value="return">Batch Return</TabsTrigger>
                </TabsList>
                
                <TabsContent value="loan">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Borrower Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Borrower Name
                          </label>
                          <Input placeholder="Enter borrower name" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Due Date
                          </label>
                          <Input type="date" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email (optional)
                          </label>
                          <Input placeholder="Enter email address" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone (optional)
                          </label>
                          <Input placeholder="Enter phone number" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Select Items to Loan</h3>
                      <div className="border rounded-md p-4 bg-gray-50">
                        <p className="text-sm text-gray-500 mb-4">
                          Select available items to loan to this borrower.
                        </p>
                        
                        <div className="max-h-72 overflow-y-auto border rounded-md bg-white">
                          <div className="p-4 text-center text-gray-500">
                            No items selected. Click "Add Items" to select items to loan.
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <Button variant="outline" className="w-full">
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Add Items
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button variant="outline" className="mr-2">Cancel</Button>
                      <Button disabled>Process Loans</Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="return">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Return Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Return Date
                          </label>
                          <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Condition
                          </label>
                          <Select defaultValue="good">
                            <SelectTrigger>
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="excellent">Excellent</SelectItem>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="fair">Fair</SelectItem>
                              <SelectItem value="poor">Poor</SelectItem>
                              <SelectItem value="damaged">Damaged</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Select Items to Return</h3>
                      <div className="border rounded-md p-4 bg-gray-50">
                        <p className="text-sm text-gray-500 mb-4">
                          Select loaned items to mark as returned.
                        </p>
                        
                        <div className="max-h-72 overflow-y-auto border rounded-md bg-white">
                          <div className="p-4 text-center text-gray-500">
                            No items selected. Click "Add Items" to select items to return.
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <Button variant="outline" className="w-full">
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Add Items
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button variant="outline" className="mr-2">Cancel</Button>
                      <Button disabled>Process Returns</Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
