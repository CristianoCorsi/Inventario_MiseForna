import React, { useRef } from "react";
import QRCode from "react-qr-code";
import JsBarcode from "jsbarcode";
import { useReactToPrint } from "react-to-print";
import { Item } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { PrinterIcon, DownloadIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRCodeGeneratorProps {
  itemId: string;
  qrValue: string;
  name: string;
  item?: Item;
  size?: number;
  showControls?: boolean;
  showItemDetails?: boolean;
  isCompact?: boolean;
}

export function QRCodeGenerator({
  itemId,
  qrValue,
  name,
  item,
  size = 150,
  showControls = true,
  showItemDetails = false,
  isCompact = false
}: QRCodeGeneratorProps) {
  const { toast } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);
  const barcodeRef = useRef<SVGSVGElement>(null);
  
  // Generate barcode when component mounts
  React.useEffect(() => {
    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, itemId, {
          format: "CODE128",
          width: 2,
          height: 40,
          displayValue: true,
          fontSize: 12,
          margin: 0
        });
      } catch (error) {
        console.error("Failed to generate barcode:", error);
      }
    }
  }, [itemId, barcodeRef]);
  
  // Handle printing
  const handlePrint = useReactToPrint({
    content: () => qrRef.current,
    onAfterPrint: () => {
      toast({
        title: "Print job sent",
        description: "Your QR code is being printed."
      });
    }
  });
  
  // Handle downloading QR code as PNG
  const handleDownload = () => {
    if (!qrRef.current) return;
    
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;
    
    // Create a canvas element
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = size * 2;
    canvas.height = size * 2;
    
    // Draw white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create an image from the SVG
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Create download link
      const a = document.createElement("a");
      a.download = `qrcode-${itemId}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };
  
  return (
    <div className="flex flex-col items-center">
      <div 
        ref={qrRef} 
        className={`
          bg-white p-4 rounded-md border 
          ${isCompact ? 'text-center' : 'flex flex-col items-center'}
        `}
      >
        {qrValue ? (
          <QRCode 
            value={qrValue} 
            size={size} 
            level="H"
            className="mx-auto" 
          />
        ) : (
          <QRCode 
            value={itemId} 
            size={size} 
            level="H"
            className="mx-auto" 
          />
        )}
        
        <div className={`mt-2 ${isCompact ? 'text-sm' : 'text-base'}`}>
          <p className="font-medium text-center">{itemId}</p>
          {!isCompact && (
            <p className="text-center text-gray-500">{name}</p>
          )}
          
          {showItemDetails && item && (
            <div className="mt-2 text-sm text-gray-500">
              {item.location && <p>Location: {item.location}</p>}
              {item.origin && <p>Origin: {item.origin}</p>}
            </div>
          )}
        </div>
        
        {!isCompact && (
          <div className="mt-3 w-full max-w-[200px]">
            <svg ref={barcodeRef} className="w-full"></svg>
          </div>
        )}
      </div>
      
      {showControls && !isCompact && (
        <div className="flex mt-4 space-x-2">
          <Button size="sm" variant="outline" onClick={handlePrint}>
            <PrinterIcon className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownload}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      )}
    </div>
  );
}
