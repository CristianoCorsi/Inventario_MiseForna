import { 
  Item, InsertItem, 
  Location, InsertLocation, 
  Loan, InsertLoan, 
  Activity, InsertActivity, 
  Setting, InsertSetting,
  QrCode, InsertQrCode,
  items, locations, loans, activities, settings, qrCodes
} from "@shared/schema";

export interface IStorage {
  // Items
  getItems(): Promise<Item[]>;
  getItem(id: number): Promise<Item | undefined>;
  getItemByItemId(itemId: string): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: number, item: Partial<InsertItem>): Promise<Item | undefined>;
  deleteItem(id: number): Promise<boolean>;
  
  // Locations
  getLocations(): Promise<Location[]>;
  getLocation(id: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: number): Promise<boolean>;
  
  // Loans
  getLoans(): Promise<Loan[]>;
  getLoan(id: number): Promise<Loan | undefined>;
  getLoansByItemId(itemId: number): Promise<Loan[]>;
  getOverdueLoans(): Promise<Loan[]>;
  getActiveLoans(): Promise<Loan[]>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  updateLoan(id: number, loan: Partial<InsertLoan>): Promise<Loan | undefined>;
  returnLoan(id: number, returnDate?: Date): Promise<Loan | undefined>;
  deleteLoan(id: number): Promise<boolean>;
  
  // QR Codes
  getQrCodes(): Promise<QrCode[]>;
  getQrCode(id: number): Promise<QrCode | undefined>;
  getQrCodeByCodeId(qrCodeId: string): Promise<QrCode | undefined>;
  createQrCode(qrCode: InsertQrCode): Promise<QrCode>;
  updateQrCode(id: number, qrCode: Partial<InsertQrCode>): Promise<QrCode | undefined>;
  deleteQrCode(id: number): Promise<boolean>;
  getUnassignedQrCodes(): Promise<QrCode[]>;
  associateQrCodeWithItem(qrCodeId: string, itemId: number): Promise<QrCode | undefined>;
  
  // Activities
  getActivities(limit?: number): Promise<Activity[]>;
  getActivitiesByItemId(itemId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  updateSetting(key: string, value: string): Promise<Setting>;
}

export class MemStorage implements IStorage {
  private items: Map<number, Item>;
  private locations: Map<number, Location>;
  private loans: Map<number, Loan>;
  private activities: Map<number, Activity>;
  private settings: Map<string, Setting>;
  private qrCodes: Map<number, QrCode>;
  
  private itemCurrentId: number;
  private locationCurrentId: number;
  private loanCurrentId: number;
  private activityCurrentId: number;
  private settingCurrentId: number;
  private qrCodeCurrentId: number;
  
  constructor() {
    this.items = new Map();
    this.locations = new Map();
    this.loans = new Map();
    this.activities = new Map();
    this.settings = new Map();
    this.qrCodes = new Map();
    
    this.itemCurrentId = 1;
    this.locationCurrentId = 1;
    this.loanCurrentId = 1;
    this.activityCurrentId = 1;
    this.settingCurrentId = 1;
    this.qrCodeCurrentId = 1;
    
    // Initialize with default locations
    this.createLocation({ name: "Storage A", description: "Main storage area" });
    this.createLocation({ name: "Storage B", description: "Secondary storage" });
    this.createLocation({ name: "Medical Cabinet", description: "For medical supplies" });
    this.createLocation({ name: "Workshop", description: "Tools and equipment" });
    this.createLocation({ name: "Office", description: "Office supplies" });
    
    // Add some sample items
    this.createItem({
      itemId: "TOOL-1001",
      name: "Power Drill XR200",
      description: "Cordless power drill with battery pack",
      location: "Workshop",
      origin: "purchased",
      status: "available",
      qrCode: "TOOL-1001"
    });
    
    this.createItem({
      itemId: "LADDER-2001",
      name: "Extension Ladder",
      description: "10ft aluminum extension ladder",
      location: "Storage B",
      origin: "donated",
      donorName: "Community Hardware Store",
      status: "available",
      qrCode: "LADDER-2001"
    });
    
    this.createItem({
      itemId: "MED-3001",
      name: "First Aid Kit",
      description: "Complete first aid kit with supplies",
      location: "Medical Cabinet",
      origin: "donated",
      donorName: "Local Health Center",
      status: "available",
      qrCode: "MED-3001"
    });
    
    this.createItem({
      itemId: "PROJ-4001",
      name: "HD Projector",
      description: "1080p digital projector with HDMI",
      location: "Office",
      origin: "purchased",
      status: "loaned",
      qrCode: "PROJ-4001"
    });
    
    // Add some sample loans
    const now = new Date();
    const pastDue = new Date();
    pastDue.setDate(pastDue.getDate() - 5);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    
    this.createLoan({
      itemId: 4, // HD Projector
      borrowerName: "Community Center",
      borrowerEmail: "contact@communitycenter.org",
      borrowerPhone: "555-123-4567",
      loanDate: pastDue,
      dueDate: pastDue,
      status: "overdue"
    });
    
    this.createLoan({
      itemId: 1, // Power Drill
      borrowerName: "John Smith",
      borrowerEmail: "john@example.com",
      loanDate: now,
      dueDate: futureDate,
      notes: "For home renovation project",
      status: "active"
    });
    
    // Add sample activities
    this.createActivity({
      itemId: 3, // First Aid Kit
      activityType: "new",
      description: "Added to inventory, donated by Local Health Center",
      metadata: { location: "Medical Cabinet" }
    });
    
    this.createActivity({
      itemId: 2, // Extension Ladder
      activityType: "return",
      description: "Returned by Maria Johnson, condition: good",
      metadata: { location: "Storage B", condition: "good" }
    });
    
    this.createActivity({
      itemId: 1, // Power Drill
      activityType: "loan",
      description: "Loaned to John Smith for home renovation project",
      metadata: { borrower: "John Smith", dueDate: futureDate.toISOString() }
    });
    
    this.createActivity({
      itemId: 4, // HD Projector
      activityType: "loan",
      description: "Loaned to Community Center, now 5 days overdue",
      metadata: { borrower: "Community Center", dueDate: pastDue.toISOString(), status: "overdue" }
    });
  }
  
  // Item methods
  async getItems(): Promise<Item[]> {
    return Array.from(this.items.values());
  }
  
  async getItem(id: number): Promise<Item | undefined> {
    return this.items.get(id);
  }
  
  async getItemByItemId(itemId: string): Promise<Item | undefined> {
    return Array.from(this.items.values()).find(item => item.itemId === itemId);
  }
  
  async createItem(item: InsertItem): Promise<Item> {
    const id = this.itemCurrentId++;
    const newItem: Item = { ...item, id };
    this.items.set(id, newItem);
    return newItem;
  }
  
  async updateItem(id: number, item: Partial<InsertItem>): Promise<Item | undefined> {
    const existingItem = this.items.get(id);
    if (!existingItem) return undefined;
    
    const updatedItem = { ...existingItem, ...item };
    this.items.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteItem(id: number): Promise<boolean> {
    return this.items.delete(id);
  }
  
  // Location methods
  async getLocations(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }
  
  async getLocation(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }
  
  async createLocation(location: InsertLocation): Promise<Location> {
    const id = this.locationCurrentId++;
    const newLocation: Location = { ...location, id };
    this.locations.set(id, newLocation);
    return newLocation;
  }
  
  async updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined> {
    const existingLocation = this.locations.get(id);
    if (!existingLocation) return undefined;
    
    const updatedLocation = { ...existingLocation, ...location };
    this.locations.set(id, updatedLocation);
    return updatedLocation;
  }
  
  async deleteLocation(id: number): Promise<boolean> {
    return this.locations.delete(id);
  }
  
  // Loan methods
  async getLoans(): Promise<Loan[]> {
    return Array.from(this.loans.values());
  }
  
  async getLoan(id: number): Promise<Loan | undefined> {
    return this.loans.get(id);
  }
  
  async getLoansByItemId(itemId: number): Promise<Loan[]> {
    return Array.from(this.loans.values()).filter(loan => loan.itemId === itemId);
  }
  
  async getOverdueLoans(): Promise<Loan[]> {
    const now = new Date();
    return Array.from(this.loans.values()).filter(
      loan => loan.status === 'active' && new Date(loan.dueDate) < now
    );
  }
  
  async getActiveLoans(): Promise<Loan[]> {
    return Array.from(this.loans.values()).filter(loan => loan.status === 'active' || loan.status === 'overdue');
  }
  
  async createLoan(loan: InsertLoan): Promise<Loan> {
    const id = this.loanCurrentId++;
    const newLoan: Loan = { ...loan, id };
    this.loans.set(id, newLoan);
    
    // Update the item status to 'loaned'
    const item = await this.getItem(loan.itemId);
    if (item) {
      await this.updateItem(item.id, { status: 'loaned' });
    }
    
    return newLoan;
  }
  
  async updateLoan(id: number, loan: Partial<InsertLoan>): Promise<Loan | undefined> {
    const existingLoan = this.loans.get(id);
    if (!existingLoan) return undefined;
    
    const updatedLoan = { ...existingLoan, ...loan };
    this.loans.set(id, updatedLoan);
    return updatedLoan;
  }
  
  async returnLoan(id: number, returnDate: Date = new Date()): Promise<Loan | undefined> {
    const loan = this.loans.get(id);
    if (!loan) return undefined;
    
    const updatedLoan = { 
      ...loan, 
      returnDate: returnDate, 
      status: 'returned' 
    };
    this.loans.set(id, updatedLoan);
    
    // Update the item status back to 'available'
    const item = await this.getItem(loan.itemId);
    if (item) {
      await this.updateItem(item.id, { status: 'available' });
    }
    
    return updatedLoan;
  }
  
  async deleteLoan(id: number): Promise<boolean> {
    return this.loans.delete(id);
  }
  
  // Activity methods
  async getActivities(limit?: number): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? activities.slice(0, limit) : activities;
  }
  
  async getActivitiesByItemId(itemId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.itemId === itemId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityCurrentId++;
    const newActivity: Activity = { 
      ...activity, 
      id, 
      timestamp: activity.timestamp || new Date() 
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }
  
  // Settings methods
  async getSetting(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }
  
  async updateSetting(key: string, value: string): Promise<Setting> {
    const existingSetting = this.settings.get(key);
    
    if (existingSetting) {
      const updatedSetting = { ...existingSetting, value };
      this.settings.set(key, updatedSetting);
      return updatedSetting;
    } else {
      const id = this.settingCurrentId++;
      const newSetting: Setting = { id, key, value };
      this.settings.set(key, newSetting);
      return newSetting;
    }
  }
  
  // QR Code methods
  async getQrCodes(): Promise<QrCode[]> {
    return Array.from(this.qrCodes.values());
  }
  
  async getQrCode(id: number): Promise<QrCode | undefined> {
    return this.qrCodes.get(id);
  }
  
  async getQrCodeByCodeId(qrCodeId: string): Promise<QrCode | undefined> {
    return Array.from(this.qrCodes.values()).find(qrCode => qrCode.qrCodeId === qrCodeId);
  }
  
  async createQrCode(qrCode: InsertQrCode): Promise<QrCode> {
    const id = this.qrCodeCurrentId++;
    const newQrCode: QrCode = { 
      ...qrCode, 
      id, 
      dateGenerated: qrCode.dateGenerated || new Date(),
      isAssigned: qrCode.isAssigned || false
    };
    this.qrCodes.set(id, newQrCode);
    
    // Log activity for QR code generation
    await this.createActivity({
      activityType: "qrGenerated",
      description: `Generated QR code "${qrCode.qrCodeId}"`,
      metadata: { qrCodeId: qrCode.qrCodeId }
    });
    
    return newQrCode;
  }
  
  async updateQrCode(id: number, qrCode: Partial<InsertQrCode>): Promise<QrCode | undefined> {
    const existingQrCode = this.qrCodes.get(id);
    if (!existingQrCode) return undefined;
    
    const updatedQrCode = { ...existingQrCode, ...qrCode };
    this.qrCodes.set(id, updatedQrCode);
    return updatedQrCode;
  }
  
  async deleteQrCode(id: number): Promise<boolean> {
    return this.qrCodes.delete(id);
  }
  
  async getUnassignedQrCodes(): Promise<QrCode[]> {
    return Array.from(this.qrCodes.values()).filter(qrCode => !qrCode.isAssigned);
  }
  
  async associateQrCodeWithItem(qrCodeId: string, itemId: number): Promise<QrCode | undefined> {
    // Find the QR code
    const qrCode = await this.getQrCodeByCodeId(qrCodeId);
    if (!qrCode) return undefined;
    
    // Check if the item exists
    const item = await this.getItem(itemId);
    if (!item) return undefined;
    
    // Update the QR code
    const updatedQrCode = await this.updateQrCode(qrCode.id, {
      isAssigned: true,
      assignedToItemId: itemId,
      dateAssigned: new Date()
    });
    
    // Update the item
    await this.updateItem(itemId, {
      qrCode: qrCodeId
    });
    
    // Log activity
    await this.createActivity({
      itemId,
      activityType: "qrAssociated",
      description: `Associated QR code "${qrCodeId}" with item "${item.name}"`,
      metadata: { qrCodeId, itemId: item.itemId }
    });
    
    return updatedQrCode;
  }
}

export const storage = new MemStorage();
