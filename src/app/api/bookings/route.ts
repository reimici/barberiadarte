import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { startOfDay, endOfDay, parseISO } from 'date-fns'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const dateParam = searchParams.get('date')
  const fromParam = searchParams.get('from')
  const toParam = searchParams.get('to')

  try {
    const whereClause: Prisma.BookingWhereInput = { status: 'CONFIRMED' }
    
    // If a specific date is requested, filter bookings for that day.
    if (dateParam) {
      const date = parseISO(dateParam)
      whereClause.startTime = {
        gte: startOfDay(date),
        lte: endOfDay(date),
      }
    } else if (fromParam || toParam) {
      const start = fromParam ? startOfDay(parseISO(fromParam)) : undefined
      const end = toParam ? endOfDay(parseISO(toParam)) : undefined

      whereClause.startTime = {
        ...(start ? { gte: start } : {}),
        ...(end ? { lte: end } : {}),
      }
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        service: true,
        user: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    })

    return NextResponse.json(
      bookings.map((booking) => ({
        id: booking.id,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        serviceId: booking.serviceId,
        userId: booking.userId,
        customerName: booking.user.fullName,
        customerPhone: booking.user.phone,
        service: {
          id: booking.service.id,
          name: booking.service.name,
          priceCents: booking.service.price,
          durationMinutes: booking.service.durationMinutes,
          isPremium: booking.service.isPremium,
        },
        createdAt: booking.createdAt,
      }))
    )
  } catch (error) {
    console.error('[GET /api/bookings] failed', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { startTime, endTime, customerName, customerPhone, serviceId } = data as {
      startTime?: string
      endTime?: string
      customerName?: string
      customerPhone?: string
      serviceId?: string
    }

    // Validate inputs
    if (!startTime || !endTime || !customerName || !customerPhone || !serviceId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const startDate = new Date(startTime)
    const endDate = new Date(endTime)

    // Concurrency check: verify if the slot is already taken
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        status: 'CONFIRMED',
        AND: [
          { startTime: { lt: endDate } },
          { endTime: { gt: startDate } },
        ],
      },
    })

    if (conflictingBooking) {
      return NextResponse.json({ error: 'Slot occupato. Aggiorna la pagina per vedere le disponibilità.' }, { status: 409 })
    }

    const user = await prisma.user.upsert({
      where: { phone: customerPhone },
      update: { fullName: customerName },
      create: {
        fullName: customerName,
        phone: customerPhone,
      },
    })

    const booking = await prisma.booking.create({
      data: {
        startTime: startDate,
        endTime: endDate,
        userId: user.id,
        serviceId,
      },
      include: {
        service: true,
        user: true,
      },
    })

    return NextResponse.json({
      id: booking.id,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      serviceId: booking.serviceId,
      userId: booking.userId,
      customerName: booking.user.fullName,
      customerPhone: booking.user.phone,
      service: {
        id: booking.service.id,
        name: booking.service.name,
        priceCents: booking.service.price,
        durationMinutes: booking.service.durationMinutes,
        isPremium: booking.service.isPremium,
      },
      createdAt: booking.createdAt,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
