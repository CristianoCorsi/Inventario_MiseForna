import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-unified";
import { 
  insertItemSchema, 
  insertLocationSchema, 
  insertLoanSchema, 
  insertActivitySchema,
  insertQrCodeSchema,
  itemFormSchema,
  loanFormSchema,
  qrCodeFormSchema
} from "@shared/schema-unified";
import { z } from "zod";
import path from "path";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import { DOMImplementation, XMLSerializer } from "xmldom";
import { setupAuth, isAuthenticated, isAdmin } from "./auth-unified";

export async function registerRoutesUnified(app: Express): Promise<Server> {
  // Set up authentication routes and middleware
  setupAuth(app);
  // API Routes
  const apiRouter = app.route('/api');
  
  // Item routes - require authentication
  app.get('/api/items', isAuthenticated, async (req, res) => {
    const items = await storage.getItems();
    res.json(items);
  });

  app.get('/api/items/:id', isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const item = await storage.getItem(id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(item);
  });

  app.post('/api/items', isAuthenticated, async (req, res) => {
    try {
      const validatedData = itemFormSchema.parse(req.body);
      const item = await storage.createItem(validatedData);
      
      // Create activity log
      await storage.createActivity({
        itemId: item.id,
        activityType: 'itemCreated',
        description: `Item "${item.name}" (${item.itemId}) was created`
      });

      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Error creating item" });
    }
  });

  app.put('/api/items/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = itemFormSchema.partial().parse(req.body);
      
      const existingItem = await storage.getItem(id);
      if (!existingItem) {
        return res.status(404).json({ error: "Item not found" });
      }

      const updatedItem = await storage.updateItem(id, validatedData);
      
      // Create activity log
      await storage.createActivity({
        itemId: id,
        activityType: 'itemUpdated',
        description: `Item "${existingItem.name}" (${existingItem.itemId}) was updated`
      });

      res.json(updatedItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Error updating item" });
    }
  });

  app.delete('/api/items/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const existingItem = await storage.getItem(id);
      if (!existingItem) {
        return res.status(404).json({ error: "Item not found" });
      }

      const success = await storage.deleteItem(id);
      if (!success) {
        return res.status(500).json({ error: "Error deleting item" });
      }
      
      // Create activity log (not linked to item anymore)
      await storage.createActivity({
        activityType: 'itemDeleted',
        description: `Item "${existingItem.name}" (${existingItem.itemId}) was deleted`
      });

      res.json({ message: "Item deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error deleting item" });
    }
  });

  // Location routes - require authentication
  app.get('/api/locations', isAuthenticated, async (req, res) => {
    const locations = await storage.getLocations();
    res.json(locations);
  });

  app.get('/api/locations/:id', isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const location = await storage.getLocation(id);
    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }
    res.json(location);
  });

  app.post('/api/locations', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertLocationSchema.parse(req.body);
      const location = await storage.createLocation(validatedData);
      res.status(201).json(location);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Error creating location" });
    }
  });

  app.put('/api/locations/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertLocationSchema.partial().parse(req.body);
      
      const existingLocation = await storage.getLocation(id);
      if (!existingLocation) {
        return res.status(404).json({ error: "Location not found" });
      }

      const updatedLocation = await storage.updateLocation(id, validatedData);
      res.json(updatedLocation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Error updating location" });
    }
  });

  app.delete('/api/locations/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const existingLocation = await storage.getLocation(id);
      if (!existingLocation) {
        return res.status(404).json({ error: "Location not found" });
      }

      const success = await storage.deleteLocation(id);
      if (!success) {
        return res.status(500).json({ error: "Error deleting location" });
      }

      res.json({ message: "Location deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error deleting location" });
    }
  });

  // Loan routes - require authentication
  app.get('/api/loans', isAuthenticated, async (req, res) => {
    const loans = await storage.getLoans();
    res.json(loans);
  });

  app.get('/api/loans/:id', isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const loan = await storage.getLoan(id);
    if (!loan) {
      return res.status(404).json({ error: "Loan not found" });
    }
    res.json(loan);
  });

  app.get('/api/items/:id/loans', isAuthenticated, async (req, res) => {
    const itemId = parseInt(req.params.id);
    const loans = await storage.getLoansByItemId(itemId);
    res.json(loans);
  });

  app.get('/api/loans/overdue', isAuthenticated, async (req, res) => {
    const loans = await storage.getOverdueLoans();
    res.json(loans);
  });

  app.get('/api/loans/active', isAuthenticated, async (req, res) => {
    const loans = await storage.getActiveLoans();
    res.json(loans);
  });

  app.post('/api/loans', isAuthenticated, async (req, res) => {
    try {
      const validatedData = loanFormSchema.parse(req.body);
      
      // Check if item exists
      const item = await storage.getItem(validatedData.itemId);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      
      // Check if item is available
      if (item.status === 'loaned') {
        return res.status(400).json({ error: "Item is already loaned out" });
      }

      const loan = await storage.createLoan(validatedData);
      
      // Create activity log
      await storage.createActivity({
        itemId: validatedData.itemId,
        activityType: 'itemLoaned',
        description: `Item "${item.name}" (${item.itemId}) was loaned to ${validatedData.borrowerName}`,
        metadata: JSON.stringify({
          borrowerName: validatedData.borrowerName,
          dueDate: validatedData.dueDate
        })
      });

      res.status(201).json(loan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Error creating loan" });
    }
  });

  app.put('/api/loans/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = loanFormSchema.partial().parse(req.body);
      
      const existingLoan = await storage.getLoan(id);
      if (!existingLoan) {
        return res.status(404).json({ error: "Loan not found" });
      }

      const updatedLoan = await storage.updateLoan(id, validatedData);
      
      // Create activity log
      await storage.createActivity({
        itemId: existingLoan.itemId,
        activityType: 'loanUpdated',
        description: `Loan details updated for item #${existingLoan.itemId}`
      });

      res.json(updatedLoan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Error updating loan" });
    }
  });

  app.post('/api/loans/:id/return', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const returnDate = req.body.returnDate ? new Date(req.body.returnDate) : new Date();
      
      const existingLoan = await storage.getLoan(id);
      if (!existingLoan) {
        return res.status(404).json({ error: "Loan not found" });
      }

      const updatedLoan = await storage.returnLoan(id, returnDate);
      
      // Get item information for the activity log
      const item = await storage.getItem(existingLoan.itemId);
      
      // Create activity log
      await storage.createActivity({
        itemId: existingLoan.itemId,
        activityType: 'itemReturned',
        description: `Item "${item?.name || 'Unknown'}" was returned by ${existingLoan.borrowerName}`,
        metadata: JSON.stringify({
          borrowerName: existingLoan.borrowerName,
          returnDate: returnDate.toISOString()
        })
      });

      res.json(updatedLoan);
    } catch (error) {
      res.status(500).json({ error: "Error returning loan" });
    }
  });

  app.delete('/api/loans/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const existingLoan = await storage.getLoan(id);
      if (!existingLoan) {
        return res.status(404).json({ error: "Loan not found" });
      }

      const success = await storage.deleteLoan(id);
      if (!success) {
        return res.status(500).json({ error: "Error deleting loan" });
      }

      res.json({ message: "Loan deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error deleting loan" });
    }
  });

  // QR Code routes - require authentication
  app.get('/api/qrcodes', isAuthenticated, async (req, res) => {
    const qrCodes = await storage.getQrCodes();
    res.json(qrCodes);
  });

  app.get('/api/qrcodes/unassigned', isAuthenticated, async (req, res) => {
    const qrCodes = await storage.getUnassignedQrCodes();
    res.json(qrCodes);
  });

  app.get('/api/qrcodes/:id', isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const qrCode = await storage.getQrCode(id);
    if (!qrCode) {
      return res.status(404).json({ error: "QR code not found" });
    }
    res.json(qrCode);
  });

  app.post('/api/qrcodes', isAuthenticated, async (req, res) => {
    try {
      const validatedData = qrCodeFormSchema.parse(req.body);
      const qrCode = await storage.createQrCode(validatedData);
      res.status(201).json(qrCode);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Error creating QR code" });
    }
  });

  app.post('/api/qrcodes/:qrCodeId/associate/:itemId', isAuthenticated, async (req, res) => {
    try {
      const qrCodeId = req.params.qrCodeId;
      const itemId = parseInt(req.params.itemId);
      
      const qrCode = await storage.associateQrCodeWithItem(qrCodeId, itemId);
      if (!qrCode) {
        return res.status(400).json({ error: "Unable to associate QR code with item" });
      }
      
      res.json(qrCode);
    } catch (error) {
      res.status(500).json({ error: "Error associating QR code with item" });
    }
  });

  app.put('/api/qrcodes/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = qrCodeFormSchema.partial().parse(req.body);
      
      const existingQrCode = await storage.getQrCode(id);
      if (!existingQrCode) {
        return res.status(404).json({ error: "QR code not found" });
      }

      const updatedQrCode = await storage.updateQrCode(id, validatedData);
      res.json(updatedQrCode);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Error updating QR code" });
    }
  });

  app.delete('/api/qrcodes/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const existingQrCode = await storage.getQrCode(id);
      if (!existingQrCode) {
        return res.status(404).json({ error: "QR code not found" });
      }

      const success = await storage.deleteQrCode(id);
      if (!success) {
        return res.status(500).json({ error: "Error deleting QR code" });
      }

      res.json({ message: "QR code deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error deleting QR code" });
    }
  });

  // Activity routes - require authentication
  app.get('/api/activities', isAuthenticated, async (req, res) => {
    let limit: number | undefined = undefined;
    if (req.query.limit) {
      limit = parseInt(req.query.limit as string);
    }
    
    const activities = await storage.getActivities(limit);
    res.json(activities);
  });

  app.get('/api/items/:id/activities', isAuthenticated, async (req, res) => {
    const itemId = parseInt(req.params.id);
    const activities = await storage.getActivitiesByItemId(itemId);
    res.json(activities);
  });

  // Settings routes - require admin
  app.get('/api/settings/:key', isAuthenticated, async (req, res) => {
    const key = req.params.key;
    const setting = await storage.getSetting(key);
    if (!setting) {
      return res.status(404).json({ error: "Setting not found" });
    }
    res.json(setting);
  });

  app.put('/api/settings/:key', isAdmin, async (req, res) => {
    try {
      const key = req.params.key;
      const { value } = req.body;
      
      if (typeof value !== 'string') {
        return res.status(400).json({ error: "Value must be a string" });
      }
      
      const updatedSetting = await storage.updateSetting(key, value);
      res.json(updatedSetting);
    } catch (error) {
      res.status(500).json({ error: "Error updating setting" });
    }
  });

  // QR code and barcode generation utilities
  app.get('/api/util/generate-qr/:text', isAuthenticated, async (req, res) => {
    try {
      const text = req.params.text;
      const qrDataUrl = await QRCode.toDataURL(text);
      res.json({ qrDataUrl });
    } catch (error) {
      res.status(500).json({ error: "Error generating QR code" });
    }
  });

  app.get('/api/util/generate-barcode/:text', isAuthenticated, async (req, res) => {
    try {
      const text = req.params.text;
      
      // Create an SVG barcode
      const document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);
      const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      
      JsBarcode(svgNode, text, {
        xmlDocument: document,
        format: "CODE128",
        lineColor: "#000",
        textPosition: "bottom",
        fontSize: 16
      });
      
      const svgContent = new XMLSerializer().serializeToString(svgNode);
      const barcodeDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
      
      res.json({ barcodeDataUrl });
    } catch (error) {
      res.status(500).json({ error: "Error generating barcode" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}