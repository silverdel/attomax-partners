import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BuyButton } from '@/components/storefront/BuyButton'
import { prisma } from '@/lib/prisma'

interface PartnerStorefrontProps {
  params: {
    partnerId: string
  }
}

export default async function PartnerStorefront({ params }: PartnerStorefrontProps) {
  // Find partner by ID or slug
  const partner = await prisma.partner.findFirst({
    where: {
      OR: [
        { id: params.partnerId },
        { domain: params.partnerId }
      ],
      status: 'ACTIVE'
    }
  })

  if (!partner) {
    notFound()
  }

  // Get available products
  const products = await prisma.product.findMany({
    where: {
      status: 'ACTIVE'
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Partner Header */}
      <header className="border-b border-border bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            {partner.logoUrl && (
              <img 
                src={partner.logoUrl} 
                alt={`${partner.brandName} logo`}
                className="h-12 w-auto"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-foreground">{partner.brandName}</h1>
              <p className="text-muted-foreground">Premium ATTOMAX Golf Balls</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-50 to-blue-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Premium Golf Balls by ATTOMAX
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience superior performance with ATTOMAX golf balls. 
            Advanced aerodynamics and precision engineering for the modern golfer.
          </p>
          <Badge variant="secondary" className="text-sm">
            Powered by {partner.brandName}
          </Badge>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">Our Products</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our range of high-performance golf balls designed for every playing style.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                {product.imageUrl && (
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-xl">{product.title}</CardTitle>
                  <CardDescription>
                    {product.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-foreground">
                      ${parseFloat(product.price.toString()).toFixed(2)}
                    </span>
                    <Badge variant="outline">In Stock</Badge>
                  </div>
                  
                  {/* Shopify Buy Button with Partner Attribution */}
                  <BuyButton
                    partnerId={partner.id}
                    partnerName={partner.brandName}
                    productId={product.shopifyProductId}
                    className="w-full"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Info Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">About {partner.brandName}</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            As an authorized ATTOMAX partner, {partner.brandName} is committed to providing 
            golfers with the highest quality equipment and exceptional service.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Quality Guarantee</h4>
              <p className="text-sm text-muted-foreground">
                All products are authentic ATTOMAX golf balls with full warranty coverage.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Fast Shipping</h4>
              <p className="text-sm text-muted-foreground">
                Quick processing and reliable delivery directly from ATTOMAX.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Expert Support</h4>
              <p className="text-sm text-muted-foreground">
                Get professional advice and support from our golf equipment experts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 {partner.brandName} - Authorized ATTOMAX Partner</p>
          <p className="text-sm mt-2">
            Powered by ATTOMAX Partner Network
          </p>
        </div>
      </footer>
    </div>
  )
}

export async function generateMetadata({ params }: PartnerStorefrontProps) {
  const partner = await prisma.partner.findFirst({
    where: {
      OR: [
        { id: params.partnerId },
        { domain: params.partnerId }
      ],
      status: 'ACTIVE'
    }
  })

  return {
    title: `${partner?.brandName || 'Partner'} - Premium ATTOMAX Golf Balls`,
    description: `Shop authentic ATTOMAX golf balls at ${partner?.brandName}. Premium quality, superior performance, and expert service.`,
    openGraph: {
      title: `${partner?.brandName} - ATTOMAX Golf Balls`,
      description: 'Premium golf balls for superior performance',
    }
  }
}