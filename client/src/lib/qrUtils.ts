/**
 * Generates a unique ID for inventory items
 * @param prefix The prefix to use for the ID
 * @returns A unique ID string
 */
export function generateId(prefix: string = "ITEM-"): string {
  // Generate random alphanumeric sequence
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  // Generate numeric sequence based on current time
  const numericPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `${prefix}${randomPart}-${numericPart}`;
}

/**
 * Formats a URL for QR code generation that directs to the item detail page
 * @param itemId The item ID to encode in the URL
 * @returns A URL string that can be used for QR code generation
 */
export function generateQRCodeUrl(itemId: string): string {
  // In a real app, we would use the actual domain here
  // When running locally, we can use the Replit domains environment variable
  const domain = import.meta.env.VITE_REPLIT_DOMAINS?.split(',')[0] || window.location.origin;
  
  return `${domain}/scan?id=${encodeURIComponent(itemId)}`;
}

/**
 * Extracts an item ID from a QR code scan result
 * @param scanResult The result string from scanning a QR code
 * @returns The extracted item ID
 */
export function extractItemIdFromScan(scanResult: string): string | null {
  // Try to parse as URL first
  try {
    const url = new URL(scanResult);
    const itemId = url.searchParams.get('id');
    if (itemId) return itemId;
  } catch (e) {
    // Not a URL, continue to other formats
  }
  
  // Try to parse as JSON
  try {
    const data = JSON.parse(scanResult);
    if (data.id) return data.id;
    if (data.itemId) return data.itemId;
  } catch (e) {
    // Not JSON, continue to other formats
  }
  
  // If it looks like an item ID (contains alphanumeric characters), return it directly
  if (/^[A-Za-z0-9\-]+$/.test(scanResult)) {
    return scanResult;
  }
  
  // Couldn't extract a valid item ID
  return null;
}

/**
 * Checks if a barcode or QR code is valid
 * @param code The code to validate
 * @returns True if the code is valid
 */
export function isValidCode(code: string): boolean {
  // Simple validation for now - just check if it's non-empty
  return !!code && code.length > 0;
}
