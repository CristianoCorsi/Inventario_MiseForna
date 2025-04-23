import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useReactToPrint } from "react-to-print";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
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
import { Item, QrCode } from "@shared/schema";
import { 
  AlertCircle, 
  ArrowRightIcon, 
  ListFilterIcon, 
  MoreHorizontalIcon,
  PlusIcon, 
  PrinterIcon, 
  QrCodeIcon, 
  SearchIcon, 
  ScanIcon, 
  TagIcon,
  Table2Icon
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { t } from "@/lib/i18n";

export default function QRCodes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [printMode, setPrintMode] = useState<'single' | 'multi'>('single');
  const [labelsPerPage, setLabelsPerPage] = useState("12");
  const [activeTab, setActiveTab] = useState<'items' | 'pregenerated'>('items');
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrPrefix, setQrPrefix] = useState("ITEM-");
  const [qrQuantity, setQrQuantity] = useState("10");
  const [qrDescription, setQrDescription] = useState("");
  const [selectedQrCodes, setSelectedQrCodes] = useState<number[]>([]);
  const printRef = useRef<HTMLDivElement>(null);
  
  // Queries for items and their locations
  const { data: items, isLoading } = useQuery<Item[]>({
    queryKey: ["/api/items"],
  });
  
  const { data: locations } = useQuery({
    queryKey: ["/api/locations"]
  });
  
  // Query for unassigned QR codes
  const { 
    data: unassignedQrCodes, 
    isLoading: isLoadingQrCodes 
  } = useQuery<QrCode[]>({
    queryKey: ["/api/qrcodes/unassigned"],
  });
  
  // Mutation for generating batch QR codes
  const generateQrCodesMutation = useMutation({
    mutationFn: async (data: { prefix: string; quantity: number; description?: string }) => {
      return await apiRequest("/api/qrcodes/batch", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: t("qrcode.generated"),
        description: t("qrcode.generatedSuccess"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/qrcodes/unassigned"] });
      setQrDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: t("app.error"),
        description: t("qrcode.generationFailed"),
        variant: "destructive",
      });
    },
  });
  
  // Mutation for associating QR code with item
  const associateQrCodeMutation = useMutation({
    mutationFn: async (data: { qrCodeId: string; itemId: number }) => {
      return await apiRequest("/api/qrcodes/associate", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title: t("qrcode.associated"),
        description: t("qrcode.associatedSuccess"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/qrcodes/unassigned"] });
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
    },
    onError: (error) => {
      toast({
        title: t("app.error"),
        description: t("qrcode.associationFailed"),
        variant: "destructive",
      });
    },
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
      title: t("qrcode.scanner"),
      description: t("qrcode.scannerSoon")
    });
  };
  
  const handleToggleQrCode = (qrCodeId: number) => {
    setSelectedQrCodes(prev => 
      prev.includes(qrCodeId) 
        ? prev.filter(id => id !== qrCodeId) 
        : [...prev, qrCodeId]
    );
  };
  
  const handleGenerateQrCodes = () => {
    if (generateQrCodesMutation.isPending) return;
    
    const quantity = parseInt(qrQuantity, 10);
    if (isNaN(quantity) || quantity <= 0 || quantity > 100) {
      toast({
        title: t("app.error"),
        description: t("qrcode.quantityInvalid"),
        variant: "destructive",
      });
      return;
    }
    
    generateQrCodesMutation.mutate({
      prefix: qrPrefix,
      quantity,
      description: qrDescription || undefined,
    });
  };
  
  const handleOpenQrDialog = () => {
    setQrDialogOpen(true);
  };
  
  const handleAssociateQrCode = (qrCode: QrCode, itemId: number) => {
    if (!qrCode || !itemId || associateQrCodeMutation.isPending) return;
    
    associateQrCodeMutation.mutate({
      qrCodeId: qrCode.qrCodeId,
      itemId,
    });
  };
  
  return (
    <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{t('qrcode.title')}</h1>
        <div className="mt-3 flex sm:mt-0 sm:ml-4">
          <Button variant="outline" onClick={handleOpenQrDialog} className="mr-3">
            <QrCodeIcon className="h-4 w-4 mr-2" />
            {t('qrcode.preGenerate')}
          </Button>
          <Button variant="outline" onClick={handleScanQR} className="mr-3">
            <ScanIcon className="h-4 w-4 mr-2" />
            {t('qrcode.scanToAssociate')}
          </Button>
          <Button 
            disabled={activeTab === 'items' ? selectedItems.length === 0 : selectedQrCodes.length === 0} 
            onClick={handlePrint}
          >
            <PrinterIcon className="h-4 w-4 mr-2" />
            {t('qrcode.print')}
          </Button>
        </div>
      </div>
      
      <Tabs 
        value={activeTab === 'items' ? 'select' : 'pregenerated'} 
        onValueChange={(value) => {
          if (value === 'pregenerated') {
            setActiveTab('pregenerated');
          } else {
            setActiveTab('items');
          }
        }}
        className="mt-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="select">
            <TagIcon className="h-4 w-4 mr-2" />
            {t('inventory.title')}
          </TabsTrigger>
          <TabsTrigger value="pregenerated">
            <Table2Icon className="h-4 w-4 mr-2" />
            {t('qrcode.emptyCodesList')}
          </TabsTrigger>
          <TabsTrigger 
            value="preview" 
            disabled={activeTab === 'items' ? selectedItems.length === 0 : selectedQrCodes.length === 0}
          >
            <QrCodeIcon className="h-4 w-4 mr-2" />
            {t('qrcode.print')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pregenerated">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('qrcode.emptyCodesList')}</CardTitle>
              <CardDescription>
                {t('qrcode.emptyCodesDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingQrCodes ? (
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
              ) : unassignedQrCodes && unassignedQrCodes.length > 0 ? (
                <div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40px]">
                            <Checkbox 
                              checked={
                                unassignedQrCodes.length > 0 && 
                                selectedQrCodes.length === unassignedQrCodes.length
                              }
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedQrCodes(unassignedQrCodes.map(qr => qr.id));
                                } else {
                                  setSelectedQrCodes([]);
                                }
                              }}
                            />
                          </TableHead>
                          <TableHead>{t('qrcode.code')}</TableHead>
                          <TableHead>{t('app.description')}</TableHead>
                          <TableHead>{t('qrcode.dateGenerated')}</TableHead>
                          <TableHead>{t('app.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {unassignedQrCodes.map(qrCode => (
                          <TableRow key={qrCode.id}>
                            <TableCell>
                              <Checkbox 
                                checked={selectedQrCodes.includes(qrCode.id)}
                                onCheckedChange={() => handleToggleQrCode(qrCode.id)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{qrCode.qrCodeId}</TableCell>
                            <TableCell>{qrCode.description}</TableCell>
                            <TableCell>
                              {new Date(qrCode.dateGenerated).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontalIcon className="h-4 w-4" />
                                    <span className="sr-only">{t('app.openMenu')}</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>{t('app.actions')}</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => {
                                    // Open dialog to select an item to associate with
                                  }}>
                                    <ArrowRightIcon className="mr-2 h-4 w-4" />
                                    {t('qrcode.associateWithItem')}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <PrinterIcon className="mr-2 h-4 w-4" />
                                    {t('qrcode.print')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {selectedQrCodes.length} {t('qrcode.selected')} 
                        {selectedQrCodes.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedQrCodes([])}
                            className="ml-2"
                          >
                            {t('app.clearSelection')}
                          </Button>
                        )}
                      </p>
                    </div>
                    <Button
                      onClick={handleOpenQrDialog}
                      size="sm"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      {t('qrcode.generateNew')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <QrCodeIcon className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    {t('qrcode.noEmptyCodes')}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {t('qrcode.noEmptyCodesDescription')}
                  </p>
                  <div className="mt-6">
                    <Button onClick={handleOpenQrDialog}>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      {t('qrcode.generateNew')}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
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
      
      {/* QR Code Generation Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('qrcode.generateNew')}</DialogTitle>
            <DialogDescription>
              {t('qrcode.generateNewDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="qr-prefix">{t('qrcode.prefix')}</Label>
              <Input
                id="qr-prefix"
                value={qrPrefix}
                onChange={(e) => setQrPrefix(e.target.value)}
                placeholder="ITEM-"
              />
              <p className="text-sm text-muted-foreground">
                {t('qrcode.prefixHelp')}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="qr-quantity">{t('qrcode.quantity')}</Label>
              <Input
                id="qr-quantity"
                value={qrQuantity}
                onChange={(e) => setQrQuantity(e.target.value)}
                type="number"
                min="1"
                max="100"
              />
              <p className="text-sm text-muted-foreground">
                {t('qrcode.quantityHelp')}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="qr-description">{t('app.description')}</Label>
              <Input
                id="qr-description"
                value={qrDescription}
                onChange={(e) => setQrDescription(e.target.value)}
                placeholder={t('qrcode.descriptionPlaceholder')}
              />
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              variant="ghost" 
              onClick={() => setQrDialogOpen(false)} 
              disabled={generateQrCodesMutation.isPending}
            >
              {t('app.cancel')}
            </Button>
            <Button
              type="submit"
              onClick={handleGenerateQrCodes}
              disabled={!qrPrefix || !qrQuantity || parseInt(qrQuantity) < 1 || generateQrCodesMutation.isPending}
            >
              {generateQrCodesMutation.isPending ? (
                <span className="flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4 animate-spin" />
                  {t('app.generating')}
                </span>
              ) : t('app.generate')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
