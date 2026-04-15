import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { startOfDay, endOfDay, parseISO } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const dateParam = searchParams.get('date')

  try {
    let whereClause = { status: 'ACTIVE' } as any
    
    // If a specific date is requested, filter bookings for that day
    if (dateParam) {
      const date = parseISO(dateParam)
      whereClause.startTime = {
        gte: startOfDay(date),
        lte: endOfDay(date),
      }
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        service: true
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { startTime, endTime, customerName, customerPhone, serviceId } = data

    // Validate inputs
    if (!startTime || !endTime || !customerName || !customerPhone || !serviceId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const startDate = new Date(startTime)
    const endDate = new Date(endTime)

    // Concurrency check: verify if the slot is already taken
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        status: 'ACTIVE',
        AND: [
          { startTime: { lt: endDate } },
          { endTime: { gt: startDate } }
        ]
      }
    })

    if (conflictingBooking) {
      return NextResponse.json({ error: 'Slot occupato. Aggiorna la pagina per vedere le disponibilità.' }, { status: 409 })
    }

    const booking = await prisma.booking.create({
      data: {
        startTime: startDate,
        endTime: endDate,
        customerName,
        customerPhone,
        serviceId
      },
      include: {
        service: true
      }
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
