import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useReactToPrint } from "react-to-print";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeGenerator } from "@/components/inventory/QRCodeGenerator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Item } from "@shared/schema";
import { PrinterIcon, SearchIcon, ScanIcon } from "lucide-react";

export default function QRCodes() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [printMode, setPrintMode] = useState<'single' | 'multi'>('single');
  const [labelsPerPage, setLabelsPerPage] = useState("12");
  const printRef = useRef<HTMLDivElement>(null);
  
  const { data: items, isLoading } = useQuery<Item[]>({
    queryKey: ["/api/items"],
  });
  
  const { data: locations } = useQuery({
    queryKey: ["/api/locations"]
  });
  
  // Filter items
  const filteredItems = items?.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = locationFilter === "all" || item.location === locationFilter;
    
    return matchesSearch && matchesLocation;
  });
  
  const handleToggleItem = (itemId: number) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId) 
        : [...prev, itemId]
    );
  };
  
  const handleSelectAll = () => {
    if (filteredItems) {
      if (selectedItems.length === filteredItems.length) {
        // Deselect all
        setSelectedItems([]);
      } else {
        // Select all
        setSelectedItems(filteredItems.map(item => item.id));
      }
    }
  };
  
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => {
      toast({
        title: "Print job sent",
        description: "Your labels are being printed."
      });
    },
    pageStyle: `
      @page {
        size: auto;
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `
  });
  
  const selectedItemsData = items?.filter(item => selectedItems.includes(item.id)) || [];
  
  // Number of labels per row based on labels per page
  const getLabelsPerRow = () => {
    switch (labelsPerPage) {
      case "8": return 2;
      case "12": return 3;
      case "24": return 4;
      case "30": return 5;
      default: return 3;
    }
  };
  
  const handleScanQR = () => {
    toast({
      title: "Scanner",
      description: "QR scanner functionality will be implemented soon."
    });
  };
  
  return (
    <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">QR Code Generator</h1>
        <div className="mt-3 flex sm:mt-0 sm:ml-4">
          <Button variant="outline" onClick={handleScanQR} className="mr-3">
            <ScanIcon className="h-4 w-4 mr-2" />
            Scan QR Code
          </Button>
          <Button disabled={selectedItems.length === 0} onClick={handlePrint}>
            <PrinterIcon className="h-4 w-4 mr-2" />
            Print Selected
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="select" className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="select">Select Items</TabsTrigger>
          <TabsTrigger value="preview" disabled={selectedItems.length === 0}>Preview Labels</TabsTrigger>
        </TabsList>
        
        <TabsContent value="select">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Items for QR Code Labels</CardTitle>
              <CardDescription>
                Choose the items you want to generate QR codes for
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative mt-1">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="location-filter">Location</Label>
                  <Select
                    value={locationFilter}
                    onValueChange={setLocationFilter}
                  >
                    <SelectTrigger id="location-filter" className="mt-1">
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
                
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    className="mt-1"
                    onClick={handleSelectAll}
                  >
                    {filteredItems && selectedItems.length === filteredItems.length 
                      ? "Deselect All" 
                      : "Select All"}
                  </Button>
                </div>
              </div>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center p-3 border rounded-md">
                      <Skeleton className="h-4 w-4 mr-4" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-1/3 mb-1" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredItems && filteredItems.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredItems.map(item => (
                    <div 
                      key={item.id} 
                      className={`flex items-center p-3 border rounded-md ${
                        selectedItems.includes(item.id) ? 'bg-primary/5 border-primary/20' : ''
                      }`}
                    >
                      <Checkbox 
                        id={`item-${item.id}`}
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => handleToggleItem(item.id)}
                        className="mr-4"
                      />
                      <div className="flex-1">
                        <Label 
                          htmlFor={`item-${item.id}`} 
                          className="font-medium cursor-pointer"
                        >
                          {item.name}
                        </Label>
                        <p className="text-sm text-gray-500 mt-0.5">ID: {item.itemId}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.location}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No items match your search criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Label Preview</CardTitle>
              <CardDescription>
                Preview and customize the QR code labels before printing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="print-mode">Print Mode</Label>
                  <Select
                    value={printMode}
                    onValueChange={(value: 'single' | 'multi') => setPrintMode(value)}
                  >
                    <SelectTrigger id="print-mode" className="mt-1">
                      <SelectValue placeholder="Select print mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">One item per page</SelectItem>
                      <SelectItem value="multi">Multiple items per page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {printMode === 'multi' && (
                  <div>
                    <Label htmlFor="labels-per-page">Labels Per Page</Label>
                    <Select
                      value={labelsPerPage}
                      onValueChange={setLabelsPerPage}
                    >
                      <SelectTrigger id="labels-per-page" className="mt-1">
                        <SelectValue placeholder="Select number of labels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8">8 (2x4)</SelectItem>
                        <SelectItem value="12">12 (3x4)</SelectItem>
                        <SelectItem value="24">24 (4x6)</SelectItem>
                        <SelectItem value="30">30 (5x6)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <Button onClick={handlePrint} size="lg" className="w-full md:w-auto">
                  <PrinterIcon className="h-4 w-4 mr-2" />
                  Print {selectedItems.length} Label{selectedItems.length !== 1 ? 's' : ''}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="hidden">
            <div ref={printRef}>
              {printMode === 'single' ? (
                <div>
                  {selectedItemsData.map(item => (
                    <div 
                      key={item.id} 
                      className="page-break-after flex flex-col items-center justify-center p-8"
                    >
                      <QRCodeGenerator
                        itemId={item.itemId}
                        qrValue={item.qrCode || item.itemId}
                        name={item.name}
                        item={item}
                        size={200}
                        showItemDetails
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`grid grid-cols-${getLabelsPerRow()} gap-4 p-4`}>
                  {selectedItemsData.map(item => (
                    <div 
                      key={item.id} 
                      className="flex flex-col items-center justify-center p-2"
                    >
                      <QRCodeGenerator
                        itemId={item.itemId}
                        qrValue={item.qrCode || item.itemId}
                        name={item.name}
                        item={item}
                        size={100}
                        isCompact
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Labels Preview</CardTitle>
              <CardDescription>
                Here's how your labels will look when printed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {printMode === 'single' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedItemsData.slice(0, 6).map(item => (
                    <Card key={item.id} className="overflow-hidden">
                      <CardContent className="p-4 flex flex-col items-center">
                        <QRCodeGenerator
                          itemId={item.itemId}
                          qrValue={item.qrCode || item.itemId}
                          name={item.name}
                          item={item}
                          size={120}
                          showItemDetails
                        />
                      </CardContent>
                    </Card>
                  ))}
                  {selectedItemsData.length > 6 && (
                    <Card className="flex items-center justify-center p-6 border-dashed">
                      <p className="text-center text-gray-500">
                        +{selectedItemsData.length - 6} more labels
                      </p>
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="border p-4">
                  <div className={`grid grid-cols-${getLabelsPerRow()} gap-2`}>
                    {selectedItemsData.slice(0, parseInt(labelsPerPage)).map(item => (
                      <div 
                        key={item.id} 
                        className="border rounded p-2 flex flex-col items-center justify-center"
                      >
                        <QRCodeGenerator
                          itemId={item.itemId}
                          qrValue={item.qrCode || item.itemId}
                          name={item.name}
                          item={item}
                          size={70}
                          isCompact
                        />
                      </div>
                    ))}
                    {selectedItemsData.length > parseInt(labelsPerPage) && (
                      <div className="border rounded p-2 flex items-center justify-center">
                        <p className="text-center text-xs text-gray-500">
                          +{selectedItemsData.length - parseInt(labelsPerPage)} more
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
