import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, commissionRate, status } = body

    // Validate required fields
    if (!name || !email || commissionRate === undefined) {
      return NextResponse.json(
        { message: 'Name, email, and commission rate are required' },
        { status: 400 }
      )
    }

    // Check if partner with this email already exists
    const existingPartner = await prisma.partner.findUnique({
      where: { email }
    })

    if (existingPartner) {
      return NextResponse.json(
        { message: 'A partner with this email already exists' },
        { status: 409 }
      )
    }

    // Create new partner
    const partner = await prisma.partner.create({
      data: {
        name,
        email,
        commissionRate,
        status: status || 'PENDING',
      }
    })

    return NextResponse.json({ 
      message: 'Partner created successfully', 
      partner 
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating partner:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
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

    return NextResponse.json({ partners })
  } catch (error) {
    console.error('Error fetching partners:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}