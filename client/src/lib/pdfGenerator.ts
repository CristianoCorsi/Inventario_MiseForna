import { Item } from "@shared/schema";

/**
 * Generates a printable PDF for QR codes/labels
 * This is a utility function that works with react-to-print
 * to prepare the content for printing
 */
export function preparePrintContent(
  items: Item[], 
  options: { 
    itemsPerRow?: number;
    showDetails?: boolean;
    showBarcode?: boolean;
  } = {}
) {
  const { itemsPerRow = 3, showDetails = true, showBarcode = true } = options;
  
  // Prepare the print CSS
  const printCSS = `
    @page {
      size: auto;
      margin: 10mm;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .qr-container {
        page-break-inside: avoid;
        padding: 10mm;
        text-align: center;
      }
      .item-name {
        font-weight: bold;
        margin-top: 5mm;
        font-size: 12pt;
      }
      .item-id {
        font-size: 10pt;
        color: #666;
      }
      ${showDetails ? `
      .item-details {
        font-size: 8pt;
        color: #666;
        margin-top: 3mm;
      }
      ` : ''}
      ${showBarcode ? `
      .barcode-container {
        margin-top: 5mm;
      }
      ` : ''}
    }
  `;
  
  // Return CSS style and configuration for printing
  return {
    css: printCSS,
    itemsPerRow,
    showDetails,
    showBarcode
  };
}

/**
 * Format a QR code data URL for an item
 * This takes the raw data and formats it as a data URL that can be used by QR code generators
 */
export function formatQRData(item: Item): string {
  // Create a structured data object for the QR code
  const qrData = {
    id: item.itemId,
    name: item.name,
    location: item.location || null
  };
  
  // Return as JSON string
  return JSON.stringify(qrData);
}

/**
 * Generate a batch of labels for printing
 * This is a utility that formats multiple items into a printable batch
 */
export function generateBatchLabels(items: Item[], labelsPerPage: number): Item[][] {
  // Determine label layout based on labels per page
  let rows: number, cols: number;
  
  switch (labelsPerPage) {
    case 8: // 2x4
      rows = 4;
      cols = 2;
      break;
    case 12: // 3x4
      rows = 4;
      cols = 3;
      break;
    case 24: // 4x6
      rows = 6;
      cols = 4;
      break;
    case 30: // 5x6
      rows = 6;
      cols = 5;
      break;
    default:
      rows = 4;
      cols = 3; // Default to 12 labels per page
  }
  
  // Split the items into pages with the right number of items per page
  const pages: Item[][] = [];
  const itemsPerPage = rows * cols;
  
  for (let i = 0; i < items.length; i += itemsPerPage) {
    pages.push(items.slice(i, i + itemsPerPage));
  }
  
  return pages;
}
