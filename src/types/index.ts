// ATTOMAX Partner System Types

export type PartnerStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED'
export type CommissionStatus = 'PENDING' | 'PAID'
export type ProductStatus = 'ACTIVE' | 'INACTIVE'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED'

export interface Partner {
  id: string
  name: string
  email: string
  domain?: string
  logoUrl?: string
  brandName: string
  commissionRate: number
  status: PartnerStatus
  shopifyTag?: string
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  shopifyOrderId: string
  partnerId: string
  customerEmail: string
  totalAmount: number
  commissionAmount: number
  commissionStatus: CommissionStatus
  orderStatus: string
  createdAt: Date
  partner?: Partner
}

export interface Product {
  id: string
  shopifyProductId: string
  title: string
  description?: string
  price: number
  imageUrl?: string
  status: ProductStatus
  createdAt: Date
  updatedAt: Date
}

export interface CommissionPayment {
  id: string
  partnerId: string
  amount: number
  periodStart: Date
  periodEnd: Date
  paymentDate?: Date
  paymentMethod?: string
  status: PaymentStatus
  createdAt: Date
  partner?: Partner
}