import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: [{ isPremium: 'desc' }, { durationMinutes: 'asc' }, { name: 'asc' }],
    })
    
    // Auto-seed if empty
    if (services.length === 0) {
      await prisma.service.createMany({
        data: [
          {
            name: "Il Taglio d'Arte",
            description:
              "Consulenza morfologica, geometrie sartoriali e rifinitura a mano libera: un rituale British Vintage che scolpisce il profilo con precisione museale.",
            durationMinutes: 60,
            price: 5500,
            isPremium: true,
          },
          {
            name: 'La Rasatura Tradizionale al Panno Caldo',
            description:
              'Preparazione cutanea con panno caldo, insaponatura pennello in tasso e passaggi progressivi a lama: la barba diventa un gesto classico, profondo e impeccabile.',
            durationMinutes: 45,
            price: 4200,
            isPremium: true,
          },
          {
            name: 'Il Rituale Contouring Barba',
            description:
              'Architettura dei volumi, linee nette e sfumature morbide per valorizzare mandibola e zigomi con una scultura geometrica rigorosa ma naturale.',
            durationMinutes: 45,
            price: 3600,
            isPremium: false,
          },
          {
            name: 'Executive Grooming Signature',
            description:
              "Percorso completo di taglio, barba e styling finale: un trattamento d'immagine pensato per il gentiluomo contemporaneo che pretende equilibrio assoluto.",
            durationMinutes: 75,
            price: 7200,
            isPremium: true,
          },
        ],
      })
      const newServices = await prisma.service.findMany({
        orderBy: [{ isPremium: 'desc' }, { durationMinutes: 'asc' }, { name: 'asc' }],
      })
      return NextResponse.json(
        newServices.map((service) => ({
          ...service,
          priceCents: service.price,
        }))
      )
    }

    return NextResponse.json(
      services.map((service) => ({
        ...service,
        priceCents: service.price,
      }))
    )
  } catch (error) {
    console.error('[GET /api/services] failed', error)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}
