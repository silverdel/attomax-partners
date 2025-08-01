import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Partner Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border">
        <div className="flex h-16 items-center px-6 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">Partner Portal</h1>
        </div>
        
        <nav className="p-4 space-y-2">
          <Link href="/partner/dashboard">
            <Button variant="ghost" className="w-full justify-start">
              Dashboard
            </Button>
          </Link>
          <Link href="/partner/commissions">
            <Button variant="ghost" className="w-full justify-start">
              Commissions
            </Button>
          </Link>
          <Link href="/partner/storefront">
            <Button variant="ghost" className="w-full justify-start">
              Storefront
            </Button>
          </Link>
          <Link href="/partner/marketing">
            <Button variant="ghost" className="w-full justify-start">
              Marketing
            </Button>
          </Link>
          <Link href="/partner/orders">
            <Button variant="ghost" className="w-full justify-start">
              Orders
            </Button>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}