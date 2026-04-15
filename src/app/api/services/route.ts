import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const services = await prisma.service.findMany()
    
    // Auto-seed if empty
    if (services.length === 0) {
      await prisma.service.createMany({
        data: [
          { name: 'Taglio Capelli', duration: 30, price: 20 },
          { name: 'Regolazione Barba', duration: 30, price: 15 },
          { name: 'Taglio + Barba', duration: 60, price: 30 },
          { name: 'Sfumatura Razor', duration: 30, price: 25 },
          { name: 'Colore / Trattamento', duration: 60, price: 40 },
        ],
      })
      const newServices = await prisma.service.findMany()
      return NextResponse.json(newServices)
    }

    return NextResponse.json(services)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}
