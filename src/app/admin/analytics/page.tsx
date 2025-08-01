import { prisma } from '@/lib/prisma'

export default async function AdminAnalyticsPage() {
  const [orders, partners, products, commissions] = await Promise.all([
    prisma.order.findMany({
      include: { partner: true }
    }),
    prisma.partner.findMany(),
    prisma.product.findMany(),
    prisma.commissionPayment.findMany({
      include: { partner: true }
    })
  ])

  // Calculate analytics
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0)
  const totalCommissions = orders.reduce((sum, order) => sum + parseFloat(order.commissionAmount.toString()), 0)
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0
  const conversionRate = partners.filter(p => p.status === 'ACTIVE').length / partners.length * 100 || 0

  // Monthly data (last 6 months)
  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    
    const monthOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear()
    })
    
    monthlyData.push({
      month,
      revenue: monthOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0),
      orders: monthOrders.length
    })
  }

  // Top performing partners
  const partnerPerformance = partners.map(partner => {
    const partnerOrders = orders.filter(order => order.partnerId === partner.id)
    const revenue = partnerOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0)
    const commissionTotal = partnerOrders.reduce((sum, order) => sum + parseFloat(order.commissionAmount.toString()), 0)
    
    return {
      ...partner,
      orderCount: partnerOrders.length,
      revenue,
      commissionTotal
    }
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-2">All time</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Commissions</h3>
          <p className="text-3xl font-bold text-blue-600">${totalCommissions.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-2">{((totalCommissions / totalRevenue) * 100 || 0).toFixed(1)}% of revenue</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Avg Order Value</h3>
          <p className="text-3xl font-bold text-purple-600">${avgOrderValue.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-2">{orders.length} total orders</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Partner Conversion</h3>
          <p className="text-3xl font-bold text-orange-600">{conversionRate.toFixed(1)}%</p>
          <p className="text-sm text-gray-500 mt-2">{partners.length} total partners</p>
        </div>
      </div>

      {/* Monthly Performance Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Monthly Performance</h2>
        <div className="space-y-4">
          {monthlyData.map((data, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex-1">
                <span className="font-medium">{data.month}</span>
              </div>
              <div className="flex-1 text-center">
                <span className="text-sm text-gray-600">{data.orders} orders</span>
              </div>
              <div className="flex-1 text-right">
                <span className="font-semibold text-green-600">${data.revenue.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Partners */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Top Performing Partners</h2>
        <div className="space-y-4">
          {partnerPerformance.map((partner, index) => (
            <div key={partner.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                <div>
                  <p className="font-medium">{partner.name}</p>
                  <p className="text-sm text-gray-500">{partner.email}</p>
                </div>
              </div>
              <div className="text-center">
                <p className="font-medium">{partner.orderCount} orders</p>
                <p className="text-sm text-gray-500">Revenue: ${partner.revenue.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-blue-600">${partner.commissionTotal.toFixed(2)}</p>
                <p className="text-sm text-gray-500">commission</p>
              </div>
            </div>
          ))}
        </div>
        
        {partnerPerformance.length === 0 && (
          <p className="text-center text-gray-500 py-8">No partner performance data available yet.</p>
        )}
      </div>

      {/* Product Performance */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Product Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{products.length}</p>
            <p className="text-sm text-gray-600">Total Products</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{products.filter(p => p.status === 'ACTIVE').length}</p>
            <p className="text-sm text-gray-600">Active Products</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{products.filter(p => p.status === 'DRAFT').length}</p>
            <p className="text-sm text-gray-600">Draft Products</p>
          </div>
        </div>
      </div>
    </div>
  )
}