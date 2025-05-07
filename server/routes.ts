import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertItemSchema,
  insertLocationSchema,
  insertLoanSchema,
  insertActivitySchema,
  insertQrCodeSchema,
  itemFormSchema,
  loanFormSchema,
  qrCodeFormSchema,
} from "@shared/schema";
import { z } from "zod";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import { DOMImplementation, XMLSerializer } from "xmldom";
import { isAuthenticated, isAdmin } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  const apiRouter = app.route("/api");

  // Item routes - require authentication
  app.get("/api/items", isAuthenticated, async (req, res) => {
    const items = await storage.getItems();
    res.json(items);
  });

  app.get("/api/items/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const item = await storage.getItem(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
  });

  app.get("/api/items/code/:itemId", isAuthenticated, async (req, res) => {
    const itemId = req.params.itemId;
    const item = await storage.getItemByItemId(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
  });

  app.post("/api/items", isAuthenticated, async (req, res) => {
    try {
      // Valida i dati in ingresso
      const validatedData = insertItemSchema.parse(req.body);

      // Genera QR Code e Barcode (come già facevi)
      let qrCode = "";
      if (validatedData.itemId) {
        qrCode = await QRCode.toDataURL(validatedData.itemId);
      }

      let barcode = "";
      if (validatedData.itemId) {
        const xmlSerializer = new XMLSerializer();
        const document = new DOMImplementation().createDocument(
          "http://www.w3.org/1999/xhtml",
          "html",
          null
        );
        const svgNode = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        JsBarcode(svgNode, validatedData.itemId, {
          xmlDocument: document,
          format: "CODE128",
        });
        barcode = xmlSerializer.serializeToString(svgNode);
      }

      // Prepara l'oggetto per l'inserimento, AGGIUNGENDO dateAdded
      const itemToCreate = {
        ...validatedData,
        dateAdded: new Date().toISOString(), // <-- AGGIUNGI QUESTA LINEA
        qrCode, // qrCode generato sopra
        barcode, // barcode generato sopra
        // status ha già un default nello schema se non fornito,
        // ma se validatedData lo contiene, verrà usato quello.
      };

      // Inserisci nel database
      const newItem = await storage.createItem(itemToCreate); // Passa l'oggetto completo

      // Crea log attività (come già facevi)
      try {
        const metadataObject = {
          // Usa l'operatore nullish coalescing (??) per assicurarti di passare null
          // se i campi opzionali non sono definiti in newItem
          location: newItem.location ?? null,
          origin: newItem.origin ?? null,
          donorName: newItem.donorName ?? null,
        };

        await storage.createActivity({
          itemId: newItem.id,
          activityType: "new",
          description: `Added ${newItem.name} to inventory`,
          timestamp: new Date().toISOString(), // Aggiungi timestamp esplicito come stringa
          metadata: JSON.stringify(metadataObject), // Converti metadata in stringa JSON
        });
      } catch (activityError) {
        // È buona norma loggare anche errori specifici nella creazione dell'attività
        console.error("Error creating activity log:", activityError);
        // Decidi se questo errore debba bloccare la risposta (probabilmente no)
      }

      res.status(201).json(newItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      // Usa il logging per vedere l'errore specifico
      console.error(
        "Error creating item:",
        error instanceof Error ? error.message : String(error)
      );
      if (error instanceof Error && error.stack) {
        console.error(error.stack);
      }
      res.status(500).json({
        message: "Failed to create item",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  app.put("/api/items/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
      const validatedData = insertItemSchema.partial().parse(req.body);

      // Update QR code if itemId changed
      if (validatedData.itemId) {
        validatedData.qrCode = await QRCode.toDataURL(validatedData.itemId);

        // Update barcode
        const xmlSerializer = new XMLSerializer();
        const document = new DOMImplementation().createDocument(
          "http://www.w3.org/1999/xhtml",
          "html",
          null
        );
        const svgNode = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );

        JsBarcode(svgNode, validatedData.itemId, {
          xmlDocument: document,
          format: "CODE128",
        });

        validatedData.barcode = xmlSerializer.serializeToString(svgNode);
      }

      const updatedItem = await storage.updateItem(id, validatedData);
      if (!updatedItem) {
        return res.status(404).json({ message: "Item not found" });
      }

      // Create activity log
      await storage.createActivity({
        itemId: updatedItem.id,
        activityType: "edit",
        description: `Updated ${updatedItem.name} information`,
        metadata: {
          changes: Object.keys(validatedData).join(", "),
        },
      });

      res.json(updatedItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update item" });
    }
  });

  app.delete("/api/items/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const item = await storage.getItem(id); // Ottieni l'item PRIMA di eliminarlo
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Check if item is currently loaned (come già facevi)
    const loans = await storage.getLoansByItemId(id);
    const activeLoans = loans.filter(
      (loan) => loan.status === "active" || loan.status === "overdue"
    );
    if (activeLoans.length > 0) {
      return res.status(400).json({
        message: "Cannot delete item that is currently on loan",
      });
    }

    // Elimina l'item
    await storage.deleteItem(id);

    // Crea activity log CORRETTO
    try {
      const metadataObject = {
        itemId: item.itemId, // Usa i dati dell'item recuperato prima
        name: item.name,
      };

      await storage.createActivity({
        itemId: null,
        activityType: "delete",
        description: `Deleted ${item.name} from inventory`,
        timestamp: new Date().toISOString(),
        metadata: JSON.stringify(metadataObject),
      });
    } catch (activityError) {
      console.error(
        "Error creating activity log during delete:",
        activityError
      );
      // Non blocco la risposta per questo
    }

    res.status(204).send(); // Risposta OK (No Content)
  });

  // Location routes
  app.get("/api/locations", isAuthenticated, async (req, res) => {
    const locations = await storage.getLocations();
    res.json(locations);
  });

  app.get("/api/locations/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const location = await storage.getLocation(id);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.json(location);
  });

  app.post("/api/locations", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertLocationSchema.parse(req.body);
      const newLocation = await storage.createLocation(validatedData);
      res.status(201).json(newLocation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create location" });
    }
  });

  app.put("/api/locations/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
      const validatedData = insertLocationSchema.partial().parse(req.body);
      const updatedLocation = await storage.updateLocation(id, validatedData);

      if (!updatedLocation) {
        return res.status(404).json({ message: "Location not found" });
      }

      res.json(updatedLocation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update location" });
    }
  });

  app.delete("/api/locations/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
      // Verifica se ci sono oggetti che usano questa location
      const items = await storage.getItems();
      const location = await storage.getLocation(id);
      const locationInUse = items.some(
        (item) => item.location === (location?.name || "")
      );

      if (locationInUse) {
        return res.status(400).json({
          message: "Cannot delete location that is used by items",
        });
      }

      const success = await storage.deleteLocation(id);
      if (!success) {
        return res.status(404).json({ message: "Location not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete location" });
    }
  });

  // Loan routes
  app.get("/api/loans", isAuthenticated, async (req, res) => {
    const loans = await storage.getLoans();
    res.json(loans);
  });

  app.get("/api/loans/overdue", isAuthenticated, async (req, res) => {
    const overdueLoans = await storage.getOverdueLoans();
    res.json(overdueLoans);
  });

  app.get("/api/loans/active", isAuthenticated, async (req, res) => {
    const activeLoans = await storage.getActiveLoans();
    res.json(activeLoans);
  });

  app.get("/api/loans/item/:itemId", isAuthenticated, async (req, res) => {
    const itemId = parseInt(req.params.itemId);
    if (isNaN(itemId)) {
      return res.status(400).json({ message: "Invalid item ID format" });
    }

    const loans = await storage.getLoansByItemId(itemId);
    res.json(loans);
  });

  app.post("/api/loans", isAuthenticated, async (req, res) => {
    try {
      const validatedData = loanFormSchema.parse(req.body);

      // Check if item exists
      const item = await storage.getItem(validatedData.itemId);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      // Check if item is available
      if (item.status !== "available") {
        return res.status(400).json({
          message: "Item is not available for loan",
        });
      }

      const newLoan = await storage.createLoan(validatedData);

      // Create activity log
      await storage.createActivity({
        itemId: item.id,
        activityType: "loan",
        description: `Loaned ${item.name} to ${validatedData.borrowerName}`,
        metadata: {
          borrowerName: validatedData.borrowerName,
          dueDate: validatedData.dueDate.toISOString(),
        },
      });

      res.status(201).json(newLoan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create loan" });
    }
  });

  app.put("/api/loans/:id/return", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const loan = await storage.getLoan(id);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    if (loan.status === "returned") {
      return res.status(400).json({ message: "Loan is already returned" });
    }

    const returnDate = req.body.returnDate
      ? new Date(req.body.returnDate)
      : new Date();
    const updatedLoan = await storage.returnLoan(id, returnDate);

    // Get the item for the activity log
    const item = await storage.getItem(loan.itemId);

    // Create activity log
    if (item) {
      await storage.createActivity({
        itemId: item.id,
        activityType: "return",
        description: `${item.name} returned by ${loan.borrowerName}`,
        metadata: {
          returnDate: returnDate.toISOString(),
          condition: req.body.condition || "good",
        },
      });
    }

    res.json(updatedLoan);
  });

  // Activity routes
  app.get("/api/activities", isAuthenticated, async (req, res) => {
    const limit = req.query.limit
      ? parseInt(req.query.limit as string)
      : undefined;
    const activities = await storage.getActivities(limit);
    res.json(activities);
  });

  app.get("/api/activities/item/:itemId", isAuthenticated, async (req, res) => {
    const itemId = parseInt(req.params.itemId);
    if (isNaN(itemId)) {
      return res.status(400).json({ message: "Invalid item ID format" });
    }

    const activities = await storage.getActivitiesByItemId(itemId);
    res.json(activities);
  });

  // Stats for dashboard
  app.get("/api/stats", isAuthenticated, async (req, res) => {
    const items = await storage.getItems();
    const activeLoans = await storage.getActiveLoans();
    const overdueLoans = await storage.getOverdueLoans();

    // Count new items in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newItems = items.filter(
      (item) => new Date(item.dateAdded) >= thirtyDaysAgo
    );

    res.json({
      totalInventory: items.length,
      itemsOnLoan: activeLoans.length,
      overdueItems: overdueLoans.length,
      newItems: newItems.length,
    });
  });

  // Settings routes
  app.get("/api/settings/:key", isAuthenticated, async (req, res) => {
    const key = req.params.key;
    const setting = await storage.getSetting(key);

    if (!setting) {
      return res.json({ key, value: null });
    }

    res.json(setting);
  });

  app.post("/api/settings/:key", isAuthenticated, async (req, res) => {
    const key = req.params.key;
    const { value } = req.body;

    if (typeof value !== "string") {
      return res.status(400).json({ message: "Value must be a string" });
    }

    const setting = await storage.updateSetting(key, value);
    res.json(setting);
  });

  // QR Code routes
  app.get("/api/qrcodes", isAuthenticated, async (req, res) => {
    const qrCodes = await storage.getQrCodes();
    res.json(qrCodes);
  });

  app.get("/api/qrcodes/unassigned", isAuthenticated, async (req, res) => {
    const qrCodes = await storage.getUnassignedQrCodes();
    res.json(qrCodes);
  });

  app.get("/api/qrcodes/code/:qrCodeId", isAuthenticated, async (req, res) => {
    const qrCodeId = req.params.qrCodeId;
    const qrCode = await storage.getQrCodeByCodeId(qrCodeId);

    if (!qrCode) {
      return res.status(404).json({ message: "QR code not found" });
    }

    res.json(qrCode);
  });

  app.get("/api/qrcodes/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const qrCode = await storage.getQrCode(id);
    if (!qrCode) {
      return res.status(404).json({ message: "QR code not found" });
    }

    res.json(qrCode);
  });

  app.post("/api/qrcodes", isAuthenticated, async (req, res) => {
    try {
      const validatedData = qrCodeFormSchema.parse(req.body);
      console.log("Creating QR code with data:", validatedData);

      // Generate QR code image
      const qrDataUrl = await QRCode.toDataURL(validatedData.qrCodeId);

      const newQrCode = await storage.createQrCode({
        ...validatedData,
        isAssigned: false,
      });

      res.status(201).json(newQrCode);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating QR code:", error);
      res.status(500).json({
        message: "Failed to create QR code",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  app.post("/api/qrcodes/batch", isAuthenticated, async (req, res) => {
    try {
      const { prefix, quantity, description } = req.body;
      console.log("Creating batch QR codes:", {
        prefix,
        quantity,
        description,
      });

      if (!prefix || typeof prefix !== "string") {
        return res.status(400).json({ message: "Prefix is required" });
      }

      if (
        !quantity ||
        typeof quantity !== "number" ||
        quantity <= 0 ||
        quantity > 100
      ) {
        return res
          .status(400)
          .json({ message: "Quantity must be between 1 and 100" });
      }

      const results = [];
      const now = new Date();

      for (let i = 0; i < quantity; i++) {
        // Generate unique ID with prefix and sequential number
        const paddedNumber = (i + 1).toString().padStart(4, "0");
        const qrCodeId = `${prefix}-${paddedNumber}`;

        const newQrCode = await storage.createQrCode({
          qrCodeId,
          description: description || `Pre-generated QR code ${qrCodeId}`,
          dateGenerated: now,
          isAssigned: false,
        });

        results.push(newQrCode);
      }

      console.log(`Generated ${results.length} QR codes`);
      res.status(201).json(results);
    } catch (error) {
      console.error("Error creating batch QR codes:", error);
      res.status(500).json({
        message: "Failed to create batch QR codes",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  app.post("/api/qrcodes/associate", isAuthenticated, async (req, res) => {
    try {
      const { qrCodeId, itemId } = req.body;
      console.log("Associating QR code:", { qrCodeId, itemId });

      if (!qrCodeId || typeof qrCodeId !== "string") {
        return res.status(400).json({ message: "QR code ID is required" });
      }

      if (!itemId || typeof itemId !== "number") {
        return res.status(400).json({ message: "Item ID is required" });
      }

      // Check if QR code exists
      const qrCode = await storage.getQrCodeByCodeId(qrCodeId);
      if (!qrCode) {
        return res.status(404).json({ message: "QR code not found" });
      }

      // Check if already assigned
      if (qrCode.isAssigned) {
        return res.status(400).json({ message: "QR code is already assigned" });
      }

      // Check if item exists
      const item = await storage.getItem(itemId);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      const updatedQrCode = await storage.associateQrCodeWithItem(
        qrCodeId,
        itemId
      );
      console.log("QR code successfully associated with item");

      res.json(updatedQrCode);
    } catch (error) {
      console.error("Error associating QR code with item:", error);
      res.status(500).json({
        message: "Failed to associate QR code with item",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Batch processing
  app.post("/api/batch/loans", isAuthenticated, async (req, res) => {
    const { itemIds, borrowerInfo, dueDate } = req.body;

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ message: "Item IDs are required" });
    }

    if (!borrowerInfo || !borrowerInfo.name) {
      return res.status(400).json({ message: "Borrower name is required" });
    }

    if (!dueDate) {
      return res.status(400).json({ message: "Due date is required" });
    }

    const dueDateObj = new Date(dueDate);
    const results = [];
    const errors = [];

    for (const itemId of itemIds) {
      try {
        const id = parseInt(itemId);

        // Check if item exists
        const item = await storage.getItem(id);
        if (!item) {
          errors.push({ itemId, message: "Item not found" });
          continue;
        }

        // Check if item is available
        if (item.status !== "available") {
          errors.push({
            itemId,
            message: `Item ${item.name} is not available for loan`,
          });
          continue;
        }

        // Create loan
        const newLoan = await storage.createLoan({
          itemId: id,
          borrowerName: borrowerInfo.name,
          borrowerEmail: borrowerInfo.email || "",
          borrowerPhone: borrowerInfo.phone || "",
          dueDate: dueDateObj,
          notes: borrowerInfo.notes || "",
          status: "active",
        });

        // Create activity
        await storage.createActivity({
          itemId: id,
          activityType: "loan",
          description: `Loaned ${item.name} to ${borrowerInfo.name}`,
          metadata: {
            borrowerName: borrowerInfo.name,
            dueDate: dueDateObj.toISOString(),
          },
        });

        results.push({ itemId, loan: newLoan });
      } catch (error) {
        errors.push({ itemId, message: "Failed to process loan" });
      }
    }

    res.json({ results, errors });
  });

  app.post("/api/batch/returns", isAuthenticated, async (req, res) => {
    const { loanIds, returnDate, condition } = req.body;

    if (!Array.isArray(loanIds) || loanIds.length === 0) {
      return res.status(400).json({ message: "Loan IDs are required" });
    }

    const returnDateObj = returnDate ? new Date(returnDate) : new Date();
    const results = [];
    const errors = [];

    for (const loanId of loanIds) {
      try {
        const id = parseInt(loanId);

        // Check if loan exists
        const loan = await storage.getLoan(id);
        if (!loan) {
          errors.push({ loanId, message: "Loan not found" });
          continue;
        }

        if (loan.status === "returned") {
          errors.push({
            loanId,
            message: "Loan is already returned",
          });
          continue;
        }

        // Return loan
        const updatedLoan = await storage.returnLoan(id, returnDateObj);

        // Get the item for the activity log
        const item = await storage.getItem(loan.itemId);

        // Create activity log
        if (item) {
          await storage.createActivity({
            itemId: item.id,
            activityType: "return",
            description: `${item.name} returned by ${loan.borrowerName}`,
            metadata: {
              returnDate: returnDateObj.toISOString(),
              condition: condition || "good",
            },
          });
        }

        results.push({ loanId, loan: updatedLoan });
      } catch (error) {
        errors.push({ loanId, message: "Failed to process return" });
      }
    }

    res.json({ results, errors });
  });

  const httpServer = createServer(app);
  return httpServer;
}
