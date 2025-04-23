import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
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
import { 
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subDays } from "date-fns";
import { Item, Loan, Activity } from "@shared/schema";
import { PrinterIcon, DownloadIcon, FilterIcon } from "lucide-react";

export default function Reports() {
  const printRef = useRef<HTMLDivElement>(null);
  const [reportType, setReportType] = useState("inventory");
  const [dateRange, setDateRange] = useState("30");
  
  const { data: items, isLoading: itemsLoading } = useQuery<Item[]>({
    queryKey: ["/api/items"],
  });
  
  const { data: loans, isLoading: loansLoading } = useQuery<Loan[]>({
    queryKey: ["/api/loans"],
  });
  
  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });
  
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });
  
  // Prepare data for inventory status chart
  const getInventoryStatusData = () => {
    if (!items) return [];
    
    const statusCount = items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(statusCount).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));
  };
  
  // Prepare data for inventory by location chart
  const getInventoryByLocationData = () => {
    if (!items) return [];
    
    const locationCount = items.reduce((acc, item) => {
      const location = item.location || "Unspecified";
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(locationCount).map(([location, count]) => ({
      name: location,
      count
    }));
  };
  
  // Prepare data for loan status chart
  const getLoanStatusData = () => {
    if (!loans) return [];
    
    const statusCount = loans.reduce((acc, loan) => {
      acc[loan.status] = (acc[loan.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(statusCount).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));
  };
  
  // Prepare data for activity timeline
  const getActivityTimelineData = () => {
    if (!activities) return [];
    
    // Get date range
    const days = parseInt(dateRange);
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    
    // Initialize array with dates
    const dateMap: Record<string, { date: string, count: number }> = {};
    for (let i = 0; i <= days; i++) {
      const date = subDays(endDate, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      dateMap[dateStr] = { date: format(date, 'MMM d'), count: 0 };
    }
    
    // Count activities per day
    activities.forEach(activity => {
      const activityDate = new Date(activity.timestamp);
      if (activityDate >= startDate && activityDate <= endDate) {
        const dateStr = format(activityDate, 'yyyy-MM-dd');
        if (dateMap[dateStr]) {
          dateMap[dateStr].count++;
        }
      }
    });
    
    // Convert to array and sort by date
    return Object.values(dateMap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(({ date, count }) => ({ date, activities: count }));
  };
  
  // Chart colors
  const chartColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
  
  const isLoading = itemsLoading || loansLoading || activitiesLoading;
  
  return (
    <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
      {/* Page Header */}
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <div className="mt-3 flex sm:mt-0 sm:ml-4">
          <Button variant="outline" className="mr-3" onClick={handlePrint}>
            <PrinterIcon className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Report Controls */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Report Type
          </label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inventory">Inventory Status</SelectItem>
              <SelectItem value="loans">Loan Status</SelectItem>
              <SelectItem value="activity">Activity Timeline</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last 365 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-end">
          <Button className="w-full">
            <FilterIcon className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>
      
      {/* Report Content */}
      <div ref={printRef}>
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {reportType === "inventory" ? "Inventory Status Report" : 
                 reportType === "loans" ? "Loan Status Report" : 
                 "Activity Timeline Report"}
              </CardTitle>
              <CardDescription>
                {reportType === "inventory" ? "Overview of current inventory status and distribution" : 
                 reportType === "loans" ? "Summary of active, overdue and returned loans" : 
                 `Activity trends over the last ${dateRange} days`}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Skeleton className="h-[300px] w-full" />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {reportType === "inventory" && (
                    <>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Inventory by Status</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={getInventoryStatusData()}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={100}
                                  paddingAngle={5}
                                  dataKey="value"
                                  label={(entry) => `${entry.name}: ${entry.value}`}
                                >
                                  {getInventoryStatusData().map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                  ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Inventory by Location</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={getInventoryByLocationData()}
                                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                  dataKey="name" 
                                  angle={-45} 
                                  textAnchor="end"
                                  height={80}
                                />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="hsl(var(--chart-1))" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                  
                  {reportType === "loans" && (
                    <>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Loan Status Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={getLoanStatusData()}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={100}
                                  paddingAngle={5}
                                  dataKey="value"
                                  label={(entry) => `${entry.name}: ${entry.value}`}
                                >
                                  {getLoanStatusData().map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                  ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Loan Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-blue-50 rounded-md p-4 text-center">
                                <p className="text-sm text-gray-500">Total Loans</p>
                                <p className="text-2xl font-semibold text-primary">
                                  {loans?.length || 0}
                                </p>
                              </div>
                              <div className="bg-amber-50 rounded-md p-4 text-center">
                                <p className="text-sm text-gray-500">Active Loans</p>
                                <p className="text-2xl font-semibold text-accent">
                                  {loans?.filter(loan => loan.status === "active").length || 0}
                                </p>
                              </div>
                              <div className="bg-red-50 rounded-md p-4 text-center">
                                <p className="text-sm text-gray-500">Overdue</p>
                                <p className="text-2xl font-semibold text-destructive">
                                  {loans?.filter(loan => loan.status === "overdue").length || 0}
                                </p>
                              </div>
                              <div className="bg-green-50 rounded-md p-4 text-center">
                                <p className="text-sm text-gray-500">Returned</p>
                                <p className="text-2xl font-semibold text-success">
                                  {loans?.filter(loan => loan.status === "returned").length || 0}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                  
                  {reportType === "activity" && (
                    <Card className="lg:col-span-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Activity Timeline</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={getActivityTimelineData()}
                              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="date" 
                                angle={-45} 
                                textAnchor="end"
                                height={80}
                              />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="activities" name="Activities" fill="hsl(var(--chart-1))" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="text-sm text-gray-500 border-t pt-4">
              Report generated on {format(new Date(), 'MMMM d, yyyy h:mm a')} • 
              Data range: Last {dateRange} days
            </CardFooter>
          </Card>
        </div>
        
        {/* Summary Tables */}
        {reportType === "inventory" && !isLoading && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Count</th>
                        <th className="text-left py-3 px-4">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getInventoryStatusData().map((status, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-4">{status.name}</td>
                          <td className="py-3 px-4">{status.value}</td>
                          <td className="py-3 px-4">
                            {((status.value / (items?.length || 1)) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                      <tr className="font-medium">
                        <td className="py-3 px-4">Total</td>
                        <td className="py-3 px-4">{items?.length || 0}</td>
                        <td className="py-3 px-4">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
