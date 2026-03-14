// Type definitions for the Cafe Billing App

export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  avatar?: string;
}

export interface Business {
  id: string;
  name: string;
  logo?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contact?: {
    phone: string;
    email?: string;
  };
  leagalInfo?: {
    gstNumber?: string;
    panNumber?: string;
  };
  defaultTaxRate?: number;
  subscription: {
    status: Boolean;
    endDate?: Date;
    startDate?: Date;
    planId?: string;
    duration?: number;
    amount?: number;
    logs?: [{ _date: Date; message: string }];
  };
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  imgUrl?: string;
  category?: string;
  description?: string;
  isAvailable: boolean;
  categoryId?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface BillItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  subtotal: number;
}

export interface Bill {
  id: string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  createdAt: Date;
  businessId: string;
  paymentMethod?: "cash" | "card" | "upi";
  status: "pending" | "paid" | "cancelled";
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  currentBusiness: Business | null;
  token: string | null;
  refreshToken: string | null;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  id?: string;
  tenantId: string;
  customerName?: string;
  customerPhone?: string;
  items: InvoiceItem[];
  totalAmount: number;
  subTotal: number;
  tax?: number;
  discount?: number;
  paymentMethod: "cash" | "card" | "upi";
  status: "paid" | "pending" | "cancelled";
  userId?: string; // Billed by
  createdAt: string;
}

export enum Roles {
  ADMIN = "admin",
  OWNER = "owner",
  STAFF = "staff",
}
