import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminPartnersPage() {
  const partners = await prisma.partner.findMany({
    include: {
      orders: {
        select: {
          totalAmount: true,
          commissionAmount: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Partners</h1>
          <p className="text-muted-foreground">Manage your ATTOMAX partner network</p>
        </div>
        <Button asChild>
          <Link href="/admin/partners/new">Add New Partner</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Partner List</CardTitle>
          <CardDescription>All registered partners in your system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Commission Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.map((partner) => {
                const totalSales = partner.orders.reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0)
                
                return (
                  <TableRow key={partner.id}>
                    <TableCell className="font-medium">{partner.name}</TableCell>
                    <TableCell>{partner.email}</TableCell>
                    <TableCell>{parseFloat(partner.commissionRate.toString())}%</TableCell>
                    <TableCell>
                      <Badge variant={partner.status === 'ACTIVE' ? 'default' : 
                                   partner.status === 'PENDING' ? 'secondary' : 'destructive'}>
                        {partner.status}
                      </Badge>
                    </TableCell>
                    <TableCell>${totalSales.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}