import Dexie, { Table } from 'dexie';
import bcrypt from 'bcryptjs';
import type { User, Product, Sale, Staff, CartItem } from '@shared/schema';

export class SmartPOSDB extends Dexie {
  users!: Table<User>;
  products!: Table<Product>;
  sales!: Table<Sale>;
  staff!: Table<Staff>;

  constructor() {
    super('SmartPOSDB');
    
    this.version(1).stores({
      users: '++id, username, email, mobile, role, staffId',
      products: '++id, name, barcode, category',
      sales: '++id, staffId, createdAt',
      staff: '++id, staffId, createdBy'
    });
  }
}

export const db = new SmartPOSDB();

// Auth service
export class AuthService {
  static async createAdmin(userData: {
    businessName: string;
    ownerName: string;
    mobile: string;
    password: string;
  }): Promise<User> {
    // Check if admin already exists
    const existingAdmin = await db.users.where('role').equals('admin').first();
    if (existingAdmin) {
      throw new Error('Admin account already exists');
    }

    // Check if mobile number is already used
    const existingUser = await db.users.where('mobile').equals(userData.mobile).first();
    if (existingUser) {
      throw new Error('Mobile number already registered');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user: User = {
      id: crypto.randomUUID(),
      username: userData.mobile,
      email: null,
      mobile: userData.mobile,
      password: hashedPassword,
      role: 'admin',
      staffId: null,
      businessName: userData.businessName,
      ownerName: userData.ownerName,
      createdAt: new Date(),
    };

    await db.users.add(user);
    return user;
  }

  static async loginAdmin(username: string, password: string): Promise<User | null> {
    const user = await db.users.where('username').equals(username).first();
    if (!user || user.role !== 'admin') return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  static async loginStaff(staffId: string, passkey: string): Promise<User | null> {
    const staffMember = await db.staff.where('staffId').equals(staffId).first();
    if (!staffMember) return null;
    
    const isValid = await bcrypt.compare(passkey, staffMember.passkey);
    if (!isValid) return null;

    // Return a user-like object for staff
    return {
      id: staffMember.id,
      username: staffMember.name,
      email: '',
      mobile: '',
      password: '',
      role: 'staff' as const,
      staffId: staffMember.staffId,
      businessName: '',
      ownerName: staffMember.name,
      createdAt: staffMember.createdAt,
    };
  }

  static async createStaff(staffData: {
    name: string;
    staffId: string;
    passkey: string;
    createdBy: string;
  }): Promise<Staff> {
    // Check if staff ID already exists
    const existingStaff = await db.staff.where('staffId').equals(staffData.staffId).first();
    if (existingStaff) {
      throw new Error('Staff ID already exists');
    }

    const hashedPasskey = await bcrypt.hash(staffData.passkey, 10);
    
    const staff: Staff = {
      id: crypto.randomUUID(),
      name: staffData.name,
      staffId: staffData.staffId,
      passkey: hashedPasskey,
      createdBy: staffData.createdBy,
      createdAt: new Date(),
    };

    await db.staff.add(staff);
    return staff;
  }
}

// Product service
export class ProductService {
  static async getAllProducts(): Promise<Product[]> {
    return await db.products.toArray();
  }

  static async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    return await db.products.where('barcode').equals(barcode).first();
  }

  static async addProduct(productData: {
    name: string;
    barcode: string;
    price: number;
    quantity: number;
    category?: string;
  }): Promise<Product> {
    // Check if product with same barcode already exists
    const existingProduct = await db.products.where('barcode').equals(productData.barcode).first();
    if (existingProduct) {
      throw new Error('Product with this barcode already exists');
    }

    // Validate data
    if (productData.price <= 0) {
      throw new Error('Price must be greater than 0');
    }
    
    if (productData.quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    const product: Product = {
      id: crypto.randomUUID(),
      name: productData.name.trim(),
      barcode: productData.barcode.trim(),
      price: Math.round(productData.price * 100) / 100, // Round to 2 decimal places
      quantity: Math.floor(productData.quantity), // Ensure integer
      category: productData.category?.trim() || 'general',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.products.add(product);
    return product;
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const existingProduct = await db.products.get(id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }

    // If updating barcode, check for duplicates
    if (updates.barcode && updates.barcode !== existingProduct.barcode) {
      const duplicateProduct = await db.products.where('barcode').equals(updates.barcode).first();
      if (duplicateProduct && duplicateProduct.id !== id) {
        throw new Error('Product with this barcode already exists');
      }
    }

    // Validate updates
    if (updates.price !== undefined && updates.price <= 0) {
      throw new Error('Price must be greater than 0');
    }
    
    if (updates.quantity !== undefined && updates.quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    // Clean and validate string fields
    const cleanUpdates: Partial<Product> = { ...updates };
    if (cleanUpdates.name) cleanUpdates.name = cleanUpdates.name.trim();
    if (cleanUpdates.barcode) cleanUpdates.barcode = cleanUpdates.barcode.trim();
    if (cleanUpdates.category) cleanUpdates.category = cleanUpdates.category.trim();
    if (cleanUpdates.price) cleanUpdates.price = Math.round(cleanUpdates.price * 100) / 100;
    if (cleanUpdates.quantity) cleanUpdates.quantity = Math.floor(cleanUpdates.quantity);

    await db.products.update(id, { ...cleanUpdates, updatedAt: new Date() });
  }

  static async deleteProduct(id: string): Promise<void> {
    await db.products.delete(id);
  }

  static async updateStock(productId: string, quantityChange: number): Promise<void> {
    const product = await db.products.get(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const newQuantity = product.quantity + quantityChange;
    if (newQuantity < 0) {
      throw new Error('Insufficient stock');
    }

    await db.products.update(productId, {
      quantity: newQuantity,
      updatedAt: new Date(),
    });
  }
}

// Sales service
export class SalesService {
  static async processSale(saleData: {
    items: CartItem[];
    total: number;
    paymentType: 'cash' | 'ewallet';
    paymentAmount: number;
    staffId?: string;
  }): Promise<Sale> {
    // Validate sale data
    if (!saleData.items || saleData.items.length === 0) {
      throw new Error('Cannot process sale with empty cart');
    }

    if (saleData.total <= 0) {
      throw new Error('Sale total must be greater than 0');
    }

    if (saleData.paymentType === 'cash' && saleData.paymentAmount < saleData.total) {
      throw new Error('Insufficient payment amount for cash transaction');
    }

    // Check stock availability for all items before processing
    for (const item of saleData.items) {
      const product = await ProductService.getProductByBarcode(item.productId) || 
                     await db.products.get(item.productId);
      
      if (!product) {
        throw new Error(`Product ${item.name} no longer exists`);
      }

      if (product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${item.name}. Available: ${product.quantity}, Required: ${item.quantity}`);
      }
    }

    const sale: Sale = {
      id: crypto.randomUUID(),
      total: Math.round(saleData.total * 100) / 100,
      paymentType: saleData.paymentType,
      paymentAmount: Math.round(saleData.paymentAmount * 100) / 100,
      staffId: saleData.staffId || null,
      items: JSON.stringify(saleData.items),
      createdAt: new Date(),
    };

    await db.sales.add(sale);

    // Update inventory (use a transaction-like approach)
    try {
      for (const item of saleData.items) {
        await ProductService.updateStock(item.productId, -item.quantity);
      }
    } catch (error) {
      // If stock update fails, remove the sale record to maintain consistency
      await db.sales.delete(sale.id);
      throw new Error(`Failed to update inventory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return sale;
  }

  static async getTodaysSales(): Promise<Sale[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return await db.sales.where('createdAt').above(today).toArray();
  }

  static async getTotalSales(): Promise<number> {
    const sales = await db.sales.toArray();
    return sales.reduce((total, sale) => total + sale.total, 0);
  }
}

// Staff service
export class StaffService {
  static async getAllStaff(): Promise<Staff[]> {
    return await db.staff.toArray();
  }

  static async deleteStaff(id: string): Promise<void> {
    await db.staff.delete(id);
  }
}
