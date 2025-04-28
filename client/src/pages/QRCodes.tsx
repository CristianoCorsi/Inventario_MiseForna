// QRCodes.tsx
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useReactToPrint } from "react-to-print";
import { useTranslation } from "@/lib/i18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  MoreHorizontalIcon,
  PlusIcon,
  PrinterIcon,
  QrCodeIcon,
  SearchIcon,
  ScanIcon,
  TagIcon,
  Table2Icon,
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

export default function QRCodes() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [printMode, setPrintMode] = useState<"single" | "multi">("single");
  const [labelsPerPage, setLabelsPerPage] = useState("12");
  const [activeTab, setActiveTab] = useState<"items" | "pregenerated">("items");
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrPrefix, setQrPrefix] = useState("ITEM-");
  const [qrQuantity, setQrQuantity] = useState("10");
  const [qrDescription, setQrDescription] = useState("");
  const [selectedQrCodes, setSelectedQrCodes] = useState<number[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  const { data: items, isLoading: isLoadingItems } = useQuery<Item[]>({
    queryKey: ["/api/items"],
  });

  const { data: locations } = useQuery({
    queryKey: ["/api/locations"],
  });

  const { data: unassignedQrCodes, isLoading: isLoadingQrCodes } = useQuery<
    QrCode[]
  >({
    queryKey: ["/api/qrcodes/unassigned"],
  });

  const generateQrCodesMutation = useMutation({
    mutationFn: async (data: {
      prefix: string;
      quantity: number;
      description?: string;
    }) => {
      return apiRequest("/api/qrcodes/batch", {
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
    onError: () => {
      toast({
        title: t("app.error"),
        description: t("qrcode.generationFailed"),
        variant: "destructive",
      });
    },
  });

  const associateQrCodeMutation = useMutation({
    mutationFn: async (data: { qrCodeId: string; itemId: number }) => {
      return apiRequest("/api/qrcodes/associate", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: t("qrcode.associated"),
        description: t("qrcode.associatedSuccess"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/qrcodes/unassigned"] });
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
    },
    onError: () => {
      toast({
        title: t("app.error"),
        description: t("qrcode.associationFailed"),
        variant: "destructive",
      });
    },
  });

  const filteredItems = items?.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation =
      locationFilter === "all" || item.location === locationFilter;
    return matchesSearch && matchesLocation;
  });

  const handleToggleItem = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (!filteredItems) return;
    setSelectedItems((prev) =>
      prev.length === filteredItems.length
        ? []
        : filteredItems.map((i) => i.id),
    );
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => {
      toast({
        title: t("qrcode.print"),
        description: t("qrcode.print"),
      });
    },
  });

  const handleScanQR = () => {
    toast({
      title: t("qrcode.scanner"),
      description: t("qrcode.scannerSoon"),
    });
  };

  const handleToggleQrCode = (id: number) => {
    setSelectedQrCodes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleGenerateQrCodes = () => {
    if (generateQrCodesMutation.isLoading) return;
    const quantity = parseInt(qrQuantity, 10);
    if (isNaN(quantity) || quantity < 1 || quantity > 100) {
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

  const selectedItemsData =
    items?.filter((i) => selectedItems.includes(i.id)) || [];

  const getLabelsPerRow = () => {
    switch (labelsPerPage) {
      case "8":
        return 2;
      case "12":
        return 3;
      case "24":
        return 4;
      case "30":
        return 5;
      default:
        return 3;
    }
  };

  return (
    <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
      {/* Header */}
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          {t("qrcode.title")}
        </h1>
        <div className="mt-3 flex sm:mt-0 sm:ml-4">
          <Button
            variant="outline"
            onClick={() => setQrDialogOpen(true)}
            className="mr-3"
          >
            <QrCodeIcon className="h-4 w-4 mr-2" />
            {t("qrcode.preGenerate")}
          </Button>
          <Button variant="outline" onClick={handleScanQR} className="mr-3">
            <ScanIcon className="h-4 w-4 mr-2" />
            {t("qrcode.scanToAssociate")}
          </Button>
          <Button
            disabled={
              activeTab === "items"
                ? selectedItems.length === 0
                : selectedQrCodes.length === 0
            }
            onClick={handlePrint}
          >
            <PrinterIcon className="h-4 w-4 mr-2" />
            {t("qrcode.print")}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab === "items" ? "select" : "pregenerated"}
        onValueChange={(v) =>
          setActiveTab(v === "pregenerated" ? "pregenerated" : "items")
        }
        className="mt-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="select">
            <TagIcon className="h-4 w-4 mr-2" />
            {t("inventory.title")}
          </TabsTrigger>
          <TabsTrigger value="pregenerated">
            <Table2Icon className="h-4 w-4 mr-2" />
            {t("qrcode.emptyCodesList")}
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            disabled={
              activeTab === "items"
                ? selectedItems.length === 0
                : selectedQrCodes.length === 0
            }
          >
            <QrCodeIcon className="h-4 w-4 mr-2" />
            {t("qrcode.print")}
          </TabsTrigger>
        </TabsList>

        {/* Pre-generated */}
        <TabsContent value="pregenerated">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t("qrcode.emptyCodesList")}</CardTitle>
              <CardDescription>
                {t("qrcode.emptyCodesDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingQrCodes ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center p-3 border rounded-md"
                    >
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
                                selectedQrCodes.length ===
                                  unassignedQrCodes.length
                              }
                              onCheckedChange={(c) =>
                                setSelectedQrCodes(
                                  c ? unassignedQrCodes.map((qr) => qr.id) : [],
                                )
                              }
                            />
                          </TableHead>
                          <TableHead>{t("qrcode.code")}</TableHead>
                          <TableHead>{t("app.description")}</TableHead>
                          <TableHead>{t("qrcode.dateGenerated")}</TableHead>
                          <TableHead>{t("app.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {unassignedQrCodes.map((qr) => (
                          <TableRow key={qr.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedQrCodes.includes(qr.id)}
                                onCheckedChange={() =>
                                  handleToggleQrCode(qr.id)
                                }
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {qr.qrCodeId}
                            </TableCell>
                            <TableCell>{qr.description}</TableCell>
                            <TableCell>
                              {new Date(qr.dateGenerated).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontalIcon className="h-4 w-4" />
                                    <span className="sr-only">
                                      {t("app.openMenu")}
                                    </span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>
                                    {t("app.actions")}
                                  </DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      /* open association dialog */
                                    }}
                                  >
                                    <ArrowRightIcon className="mr-2 h-4 w-4" />
                                    {t("qrcode.associateWithItem")}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <PrinterIcon className="mr-2 h-4 w-4" />
                                    {t("qrcode.print")}
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
                    <p className="text-sm text-muted-foreground">
                      {selectedQrCodes.length} {t("qrcode.selected")}
                      {selectedQrCodes.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedQrCodes([])}
                          className="ml-2"
                        >
                          {t("app.clearSelection")}
                        </Button>
                      )}
                    </p>
                    <Button onClick={() => setQrDialogOpen(true)} size="sm">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      {t("qrcode.generateNew")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <QrCodeIcon className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    {t("qrcode.noEmptyCodes")}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {t("qrcode.noEmptyCodesDescription")}
                  </p>
                  <Button onClick={() => setQrDialogOpen(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    {t("qrcode.generateNew")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Select existing */}
        <TabsContent value="select">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t("inventory.title")}</CardTitle>
              <CardDescription>{t("app.search")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                  <Label htmlFor="search">{t("app.search")}</Label>
                  <div className="relative mt-1">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder={t("app.search")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">{t("app.filter")}</Label>
                  <Select
                    id="location"
                    value={locationFilter}
                    onValueChange={setLocationFilter}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t("app.filter")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("app.filter")}</SelectItem>
                      {locations?.map((loc) => (
                        <SelectItem key={loc.id} value={loc.name}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={handleSelectAll}>
                    {selectedItems.length === (filteredItems?.length || 0)
                      ? t("app.clearSelection")
                      : t("app.select")}
                  </Button>
                </div>
              </div>
              {isLoadingItems ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center p-3 border rounded-md"
                    >
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
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center p-3 border rounded-md ${
                        selectedItems.includes(item.id)
                          ? "bg-primary/5 border-primary/20"
                          : ""
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
                          {item.name} ({item.itemId})
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-10 text-gray-500">
                  {t("app.noResults")}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>{t("qrcode.print")}</CardTitle>
              <CardDescription>{t("qrcode.print")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="print-mode">{t("qrcode.print")}</Label>
                <Select
                  id="print-mode"
                  value={printMode}
                  onValueChange={setPrintMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("qrcode.print")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">{t("qrcode.print")}</SelectItem>
                    <SelectItem value="multi">{t("qrcode.print")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {printMode === "multi" && (
                <div className="mb-4">
                  <Label htmlFor="labels-per-page">{t("qrcode.print")}</Label>
                  <Select
                    id="labels-per-page"
                    value={labelsPerPage}
                    onValueChange={setLabelsPerPage}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={labelsPerPage} />
                    </SelectTrigger>
                    <SelectContent>
                      {["8", "12", "24", "30"].map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button onClick={handlePrint} size="lg">
                <PrinterIcon className="h-4 w-4 mr-2" />
                {t("qrcode.print")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* QR Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("qrcode.generateNew")}</DialogTitle>
            <DialogDescription>
              {t("qrcode.generateNewDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="qr-prefix">{t("qrcode.prefix")}</Label>
              <Input
                id="qr-prefix"
                value={qrPrefix}
                onChange={(e) => setQrPrefix(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qr-quantity">{t("qrcode.quantity")}</Label>
              <Input
                id="qr-quantity"
                type="number"
                min="1"
                max="100"
                value={qrQuantity}
                onChange={(e) => setQrQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qr-description">{t("app.description")}</Label>
              <Input
                id="qr-description"
                value={qrDescription}
                onChange={(e) => setQrDescription(e.target.value)}
                placeholder={t("qrcode.descriptionPlaceholder")}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="ghost" onClick={() => setQrDialogOpen(false)}>
              {t("app.cancel")}
            </Button>
            <Button onClick={handleGenerateQrCodes}>
              {generateQrCodesMutation.isLoading
                ? t("app.generating")
                : t("app.generate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
