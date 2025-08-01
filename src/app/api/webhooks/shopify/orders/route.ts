import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractPartnerFromOrder } from '@/lib/shopify'
import crypto from 'crypto'

// Enhanced Shopify Order Webhook Handler
// Supports: orders/create, orders/paid, orders/cancelled, orders/refunded (includes partial refunds)
// Based on: https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/generate-app-access-tokens-admin

function verifyWebhook(body: string, signature: string, secret: string): boolean {
  const hash = crypto.createHmac('sha256', secret).update(body, 'utf8').digest('base64')
  return hash === signature
}

export async function POST(request: NextRequest) {
  try {
    // Use the correct Shopify webhook secret
    const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET || 'fa37b1d8b75ed66030828e9f6b67ece546f76d37e32093a56e365278beb1af24'
    if (!webhookSecret) {
      console.error('Missing SHOPIFY_WEBHOOK_SECRET')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    // Get webhook headers
    const hmacHeader = request.headers.get('x-shopify-hmac-sha256')
    const topicHeader = request.headers.get('x-shopify-topic')
    const shopDomain = request.headers.get('x-shopify-shop-domain')

    // Get raw body for signature verification
    const body = await request.text()
    
    // Verify webhook authenticity in production
    if (process.env.NODE_ENV === 'production' && hmacHeader) {
      if (!verifyWebhook(body, hmacHeader, webhookSecret)) {
        console.error('Webhook signature verification failed')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const order = JSON.parse(body)
    console.log(`Received Shopify webhook: ${topicHeader} for order ${order.id} from ${shopDomain}`)

    // Handle different webhook events
    switch (topicHeader) {
      case 'orders/create':
        return await handleOrderCreate(order)
      case 'orders/paid':
        return await handleOrderPaid(order)
      case 'orders/cancelled':
        return await handleOrderCancelled(order)
      case 'orders/refunded':
        return await handleOrderRefunded(order)
      default:
        console.log(`Unhandled webhook topic: ${topicHeader}`)
        return NextResponse.json({ message: 'Webhook received but not processed' })
    }

  } catch (error) {
    console.error('Error processing Shopify webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle order creation - initial partner attribution
async function handleOrderCreate(order: any) {
  const partnerInfo = extractPartnerFromOrder(order)
  
  if (!partnerInfo.partnerId) {
    console.log('No partner attribution found for order:', order.id)
    return NextResponse.json({ message: 'Order processed (no partner)' })
  }

  const partner = await findPartner(partnerInfo.partnerId)
  if (!partner) {
    console.error('Partner not found:', partnerInfo.partnerId)
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
  }

  const totalAmount = parseFloat(order.total_price || '0')
  const commissionRate = parseFloat(partner.commissionRate.toString())
  const commissionAmount = (totalAmount * commissionRate) / 100

  await prisma.order.upsert({
    where: { shopifyOrderId: order.id.toString() },
    update: {
      customerEmail: order.email,
      totalAmount: totalAmount,
      commissionAmount: commissionAmount,
      orderStatus: order.financial_status || 'pending',
      commissionStatus: 'PENDING',
    },
    create: {
      shopifyOrderId: order.id.toString(),
      partnerId: partner.id,
      customerEmail: order.email,
      totalAmount: totalAmount,
      commissionAmount: commissionAmount,
      commissionStatus: 'PENDING',
      orderStatus: order.financial_status || 'pending',
    }
  })

  console.log(`Order created: ${order.id} for partner ${partner.name}, commission: $${commissionAmount.toFixed(2)}`)
  return NextResponse.json({ message: 'Order created successfully', partnerId: partner.id, commissionAmount })
}

// Handle order payment - mark commission as eligible
async function handleOrderPaid(order: any) {
  await prisma.order.updateMany({
    where: { shopifyOrderId: order.id.toString() },
    data: {
      orderStatus: 'paid',
      commissionStatus: 'PENDING', // Ready for payout
    }
  })

  console.log(`Order paid: ${order.id} - commission eligible for payout`)
  return NextResponse.json({ message: 'Order payment processed' })
}

// Handle order cancellation - reverse commission
async function handleOrderCancelled(order: any) {
  await prisma.order.updateMany({
    where: { shopifyOrderId: order.id.toString() },
    data: {
      orderStatus: 'cancelled',
      commissionStatus: 'PENDING', // Will be excluded from payouts
      commissionAmount: 0, // Zero out commission
    }
  })

  console.log(`Order cancelled: ${order.id} - commission reversed`)
  return NextResponse.json({ message: 'Order cancellation processed' })
}

// Handle refunds - adjust commission
async function handleOrderRefunded(order: any) {
  const existingOrder = await prisma.order.findUnique({
    where: { shopifyOrderId: order.id.toString() }
  })

  if (existingOrder) {
    // Calculate new commission based on remaining amount after refund
    const originalAmount = parseFloat(order.total_price || '0')
    const refundedAmount = parseFloat(order.total_refunded || '0')
    const remainingAmount = originalAmount - refundedAmount
    
    const partner = await prisma.partner.findUnique({
      where: { id: existingOrder.partnerId }
    })

    if (partner) {
      const commissionRate = parseFloat(partner.commissionRate.toString())
      const newCommissionAmount = (remainingAmount * commissionRate) / 100

      await prisma.order.update({
        where: { shopifyOrderId: order.id.toString() },
        data: {
          totalAmount: remainingAmount,
          commissionAmount: Math.max(0, newCommissionAmount),
          orderStatus: remainingAmount > 0 ? 'partially_refunded' : 'refunded',
        }
      })

      console.log(`Order refunded: ${order.id} - commission adjusted to $${newCommissionAmount.toFixed(2)}`)
    }
  }

  return NextResponse.json({ message: 'Order refund processed' })
}

// Helper function to find partner
async function findPartner(partnerId: string) {
  return await prisma.partner.findFirst({
    where: {
      OR: [
        { id: partnerId },
        { shopifyTag: `partner_${partnerId}` }
      ]
    }
  })
}