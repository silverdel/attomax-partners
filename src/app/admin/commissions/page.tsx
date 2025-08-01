import { prisma } from '@/lib/prisma'

export default async function AdminCommissionsPage() {
  const [commissionPayments, orders, partners] = await Promise.all([
    prisma.commissionPayment.findMany({
      include: {
        partner: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.order.findMany({
      include: {
        partner: true
      }
    }),
    prisma.partner.findMany()
  ])

  // Calculate commission stats
  const totalCommissionsEarned = orders.reduce((sum, order) => sum + parseFloat(order.commissionAmount.toString()), 0)
  const totalCommissionsPaid = commissionPayments
    .filter(payment => payment.status === 'PAID')
    .reduce((sum, payment) => sum + parseFloat(payment.amount.toString()), 0)
  const pendingCommissions = totalCommissionsEarned - totalCommissionsPaid

  // Partner commission summary
  const partnerCommissions = partners.map(partner => {
    const partnerOrders = orders.filter(order => order.partnerId === partner.id)
    const earned = partnerOrders.reduce((sum, order) => sum + parseFloat(order.commissionAmount.toString()), 0)
    const paid = commissionPayments
      .filter(payment => payment.partnerId === partner.id && payment.status === 'PAID')
      .reduce((sum, payment) => sum + parseFloat(payment.amount.toString()), 0)
    const pending = earned - paid
    
    return {
      ...partner,
      earned,
      paid,
      pending,
      orderCount: partnerOrders.length
    }
  }).filter(partner => partner.earned > 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Commission Management</h1>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
          Process Payments
        </button>
      </div>
      
      {/* Commission Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Earned</h3>
          <p className="text-3xl font-bold text-blue-600">${totalCommissionsEarned.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-2">All time commissions</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Paid</h3>
          <p className="text-3xl font-bold text-green-600">${totalCommissionsPaid.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-2">{commissionPayments.filter(p => p.status === 'PAID').length} payments</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Pending</h3>
          <p className="text-3xl font-bold text-orange-600">${pendingCommissions.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-2">Awaiting payment</p>
        </div>
      </div>

      {/* Partner Commission Summary */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Partner Commission Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Partner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Earned
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pending
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {partnerCommissions.map((partner) => (
                <tr key={partner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                      <div className="text-sm text-gray-500">{partner.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {partner.orderCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    ${partner.earned.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ${partner.paid.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600">
                    ${partner.pending.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {partner.pending > 0 && (
                      <button className="text-green-600 hover:text-green-900">
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Commission Payments */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Recent Commission Payments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Partner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {commissionPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{payment.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.partner?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ${parseFloat(payment.amount.toString()).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      payment.status === 'PAID' 
                        ? 'bg-green-100 text-green-800'
                        : payment.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {commissionPayments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No commission payments found. Payments will appear here once processing begins.</p>
        </div>
      )}
    </div>
  )
}