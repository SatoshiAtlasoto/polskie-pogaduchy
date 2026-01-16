// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  subcategory?: string;
  weight: number; // in kg
  unit: string;
  inStock: boolean;
  storeId: string;
  storeName: string;
  deliveryTime: number; // in minutes
  rating?: number;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  distance: number; // in km
  deliveryTime: number; // in minutes
  rating: number;
  logo?: string;
}

// Cart types
export interface CartItem {
  product: Product;
  quantity: number;
}

// Delivery types
export interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedTime: number; // in minutes
  icon: string;
}

export interface CarryingOption {
  floors: number;
  pricePerFloor: number;
  totalWeight: number;
}

// Order types
export interface Order {
  id: string;
  items: CartItem[];
  deliveryOption: DeliveryOption;
  carryingOption?: CarryingOption;
  address: DeliveryAddress;
  subtotal: number;
  deliveryCost: number;
  carryingCost: number;
  serviceFee: number;
  total: number;
  status: OrderStatus;
  createdAt: Date;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'in_transit' 
  | 'delivered' 
  | 'cancelled';

export interface DeliveryAddress {
  street: string;
  building: string;
  apartment?: string;
  floor: number;
  city: string;
  postalCode: string;
  notes?: string;
}

// User types
export type UserLevel = 'guest' | 'verified' | 'pro';

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  level: UserLevel;
  addresses: DeliveryAddress[];
  depositAmount?: number;
}

// Sort types
export type SortMode = 'fastest' | 'cheapest';
