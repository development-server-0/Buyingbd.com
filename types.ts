
export interface Variant {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
}

export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'Subscription' | 'Gift Card' | 'Software' | 'Credit';
  image: string;
  variants: Variant[];
  region: 'Global' | 'US' | 'EU' | 'BD';
  isHot?: boolean;
  isRecommended?: boolean;
  discountBadge?: string;
  specs: Record<string, string>;
  vendorName: string;
  rating: number;
  reviewsCount: number;
  reviews?: Review[];
}

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  variantName: string;
  price: number;
  quantity: number;
  image: string;
}

export enum ViewState {
  HOME = 'HOME',
  CATALOG = 'CATALOG',
  PROFILE = 'PROFILE',
  CART = 'CART',
  CHECKOUT = 'CHECKOUT',
  ORDER_SUCCESS = 'ORDER_SUCCESS',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'vendor' | 'customer';
  name: string;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Refunded';
  items: CartItem[];
  paymentMethod: string;
  billingName: string;
  billingEmail: string;
}

export interface ShopApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  shopName: string;
  businessCategory: string;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
}
