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
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user: User = {
      id: crypto.randomUUID(),
      username: userData.mobile,
      email: '',
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
    const product: Product = {
      id: crypto.randomUUID(),
      name: productData.name,
      barcode: productData.barcode,
      price: productData.price,
      quantity: productData.quantity,
      category: productData.category || 'general',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.products.add(product);
    return product;
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    await db.products.update(id, { ...updates, updatedAt: new Date() });
  }

  static async deleteProduct(id: string): Promise<void> {
    await db.products.delete(id);
  }

  static async updateStock(productId: string, quantityChange: number): Promise<void> {
    const product = await db.products.get(productId);
    if (product) {
      await db.products.update(productId, {
        quantity: Math.max(0, product.quantity + quantityChange),
        updatedAt: new Date(),
      });
    }
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
    const sale: Sale = {
      id: crypto.randomUUID(),
      total: saleData.total,
      paymentType: saleData.paymentType,
      paymentAmount: saleData.paymentAmount,
      staffId: saleData.staffId || null,
      items: JSON.stringify(saleData.items),
      createdAt: new Date(),
    };

    await db.sales.add(sale);

    // Update inventory
    for (const item of saleData.items) {
      await ProductService.updateStock(item.productId, -item.quantity);
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
