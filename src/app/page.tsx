import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-foreground">ATTOMAX Partners</h1>
          </div>
          <div className="space-x-2">
            <Link href="/admin/dashboard">
              <Button variant="outline">Admin Login</Button>
            </Link>
            <Link href="/partner/dashboard">
              <Button>Partner Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Golf Ball Whitelabel Partner System
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our partner ecosystem and sell ATTOMAX golf balls under your own brand. 
            Seamless integration, automated commissions, and full marketing support.
          </p>
          <div className="space-x-4">
            <Button size="lg">Become a Partner</Button>
            <Button variant="outline" size="lg">Learn More</Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Partner with ATTOMAX?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Branded Storefront</CardTitle>
                <CardDescription>
                  Get your own fully customized storefront with your branding
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Maintain your brand identity while selling premium ATTOMAX golf balls. 
                  Custom logos, colors, and messaging on your dedicated storefront.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automated Commissions</CardTitle>
                <CardDescription>
                  Earn commissions on every sale with automated tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Real-time commission tracking with automated payouts. 
                  Full transparency and detailed reporting on your earnings.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Marketing Support</CardTitle>
                <CardDescription>
                  Access premium marketing materials and assets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Download high-quality product images, promotional content, 
                  and marketing materials to boost your sales.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 ATTOMAX Golf. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}