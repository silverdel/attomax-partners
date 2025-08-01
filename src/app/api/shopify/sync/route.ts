import { NextRequest, NextResponse } from 'next/server'
import { syncProductsToDatabase } from '@/lib/shopify'

// Admin API endpoint to sync products from Shopify
// Based on: https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/generate-app-access-tokens-admin
export async function POST(request: NextRequest) {
  try {
    // Basic auth check (in production, use proper admin authentication)
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting Shopify product sync...')
    
    const syncedCount = await syncProductsToDatabase()
    
    return NextResponse.json({
      message: 'Sync completed successfully',
      syncedProducts: syncedCount,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error syncing Shopify products:', error)
    
    return NextResponse.json(
      { 
        error: 'Sync failed', 
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Shopify Sync API',
    endpoint: 'POST /api/shopify/sync',
    description: 'Sync products from Shopify to local database',
    authentication: 'Bearer token required'
  })
}