import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { 
  PrinterIcon, 
  DownloadIcon, 
  FileTextIcon,
  SaveIcon 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QRCodeGenerator } from "./QRCodeGenerator";
import { Item, QrCode } from "@shared/schema";
import { useTranslation } from "@/lib/i18n";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface QRCodeBulkExportProps {
  items?: Item[];
  qrCodes?: QrCode[];
  labelsPerRow?: number;
  showItemDetails?: boolean;
}

export function QRCodeBulkExport({
  items = [],
  qrCodes = [],
  labelsPerRow = 3,
  showItemDetails = false
}: QRCodeBulkExportProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  
  // Handle printing
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => {
      toast({
        title: t("qrcode.print"),
        description: t("qrcode.printSuccess")
      });
    }
  });
  
  // Export to PDF
  const exportToPdf = async () => {
    if (!printRef.current) return;
    
    // Notify user
    toast({
      title: t("qrcode.exportPdf"),
      description: t("qrcode.exportPdfGenerating")
    });
    
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        backgroundColor: "#ffffff"
      });
      
      // Create PDF with appropriate dimensions
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      pdf.addImage(imgData, 'PNG', imgX, 0, imgWidth * ratio, imgHeight * ratio);
      pdf.save('qrcodes-export.pdf');
      
      toast({
        title: t("qrcode.exportPdfSuccess"),
        description: t("qrcode.exportPdfSaved")
      });
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast({
        title: t("qrcode.exportPdfError"),
        description: String(error),
        variant: "destructive"
      });
    }
  };
  
  // Determine what items we're showing
  const hasItems = items.length > 0;
  const hasQrCodes = qrCodes.length > 0;
  const totalItems = hasItems ? items.length : qrCodes.length;
  
  if (!hasItems && !hasQrCodes) {
    return <div className="text-center py-6">{t("qrcode.noItemsSelected")}</div>;
  }
  
  // Determine grid columns based on labelsPerRow
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${labelsPerRow}, 1fr)`,
    gap: '2rem',
    width: '100%',
    padding: '1rem'
  };
  
  return (
    <div className="w-full">
      <div className="mb-4 flex justify-end space-x-2">
        <Button variant="outline" onClick={handlePrint}>
          <PrinterIcon className="h-4 w-4 mr-2" />
          {t("qrcode.print")}
        </Button>
        <Button variant="outline" onClick={exportToPdf}>
          <FileTextIcon className="h-4 w-4 mr-2" />
          {t("qrcode.exportPdf")}
        </Button>
      </div>
      
      <div className="border rounded-md bg-white">
        <div ref={printRef} style={gridStyle}>
          {hasItems && items.map((item) => (
            <div key={item.id} className="print-item">
              <QRCodeGenerator
                itemId={item.itemId}
                qrValue={item.qrCode || item.itemId}
                name={item.name}
                item={item}
                size={120}
                showControls={false}
                showItemDetails={showItemDetails}
                isCompact={false}
              />
            </div>
          ))}
          
          {hasQrCodes && qrCodes.map((qrCode) => (
            <div key={qrCode.id} className="print-item">
              <QRCodeGenerator
                itemId={qrCode.qrCodeId}
                qrValue={qrCode.qrCodeId}
                name={qrCode.description || qrCode.qrCodeId}
                size={120}
                showControls={false}
                isCompact={false}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}