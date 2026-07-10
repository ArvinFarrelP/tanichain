export type Role = 'FARMER' | 'BUYER' | 'COOPERATIVE' | 'ADMIN';
export type ProductStatus = 'AVAILABLE' | 'SOLD_OUT' | 'ARCHIVED';
export type OrderStatus =
  | 'PENDING'
  | 'COMMITTED'
  | 'ESCROW_LOCKED'
  | 'DELIVERED'
  | 'CONFIRMED'
  | 'PAID'
  | 'CANCELLED'
  | 'DISPUTED';
export type TransactionType =
  | 'WALLET_FUNDING'
  | 'PAYMENT_COMMITMENT'
  | 'ESCROW_DEPOSIT'
  | 'ESCROW_RELEASE'
  | 'REFUND';
export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface Product {
  id: string;
  farmerId: string;
  name: string;
  description: string | null;
  category: string | null;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  harvestDate: string | null;
  imageUrl: string | null;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  farmer?: { id: string; fullName: string };
}

export interface PaymentCommitment {
  id: string;
  orderId: string;
  buyerPublicKey: string;
  farmerPublicKey: string;
  amount: number;
  memo: string | null;
  stellarTxHash: string | null;
  escrowLocked: boolean;
  releasedAt: string | null;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  orderId: string | null;
  type: TransactionType;
  status: TransactionStatus;
  senderPublicKey: string;
  receiverPublicKey: string;
  amount: number;
  assetCode: string;
  memo: string | null;
  stellarTxHash: string | null;
  explorerUrl: string | null;
  ledger: number | null;
  createdAt: string;
}

export interface Order {
  id: string;
  buyerId: string;
  productId: string;
  quantity: number;
  totalAmount: number;
  status: OrderStatus;
  deliveryConfirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
  product: Product;
  buyer: { id: string; fullName: string; email: string };
  paymentCommitment: PaymentCommitment | null;
  transactions: Transaction[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiListResponse<T> {
  success: true;
  data: T[];
  pagination: Pagination;
}

export interface ApiItemResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface AdminOrder {
  id: string;
  buyerId: string;
  productId: string;
  quantity: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  product: { id: string; name: string };
  buyer: { id: string; fullName: string; email: string };
}

export interface AdminTransaction {
  id: string;
  orderId: string | null;
  type: TransactionType;
  status: TransactionStatus;
  senderPublicKey: string;
  receiverPublicKey: string;
  amount: number;
  stellarTxHash: string | null;
  explorerUrl: string | null;
  createdAt: string;
  order: { id: string } | null;
}

export interface ActivityLog {
  id: string;
  userId: string | null;
  action: string;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  user?: { id: string; fullName: string; email: string; role: Role } | null;
}

export interface AnalyticsSummary {
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  escrowLockedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  pendingAmount: number;
  walletBalance: string | null;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  statusBreakdown: Array<{ status: string; count: number }>;
}

export interface PlatformOverview {
  userCount: number;
  farmerCount: number;
  buyerCount: number;
  productCount: number;
  orderCount: number;
  transactionCount: number;
  totalPlatformRevenue: number;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
  wallet: { publicKey: string; isFunded: boolean } | null;
}

export interface AdminWallet {
  id: string;
  userId: string;
  publicKey: string;
  isFunded: boolean;
  network: string;
  createdAt: string;
  user: { id: string; fullName: string; email: string; role: Role };
}

export interface WalletDetail {
  id: string;
  publicKey: string;
  isFunded: boolean;
  network: string;
  balance: string;
}

export interface QrCodeResponse {
  uri: string;
  dataUrl: string;
}
