const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.booking.deleteMany()
  await prisma.user.deleteMany()
  await prisma.service.deleteMany()

  const services = [
    {
      name: "Il Taglio d'Arte",
      description:
        "Consulenza morfologica, geometrie sartoriali e rifinitura a mano libera: un rituale British Vintage che scolpisce il profilo con precisione museale.",
      durationMinutes: 60,
      price: 5500,
      isPremium: true,
    },
    {
      name: "La Rasatura Tradizionale al Panno Caldo",
      description:
        "Preparazione cutanea con panno caldo, insaponatura pennello in tasso e passaggi progressivi a lama: la barba diventa un gesto classico, profondo e impeccabile.",
      durationMinutes: 45,
      price: 4200,
      isPremium: true,
    },
    {
      name: "Il Rituale Contouring Barba",
      description:
        "Architettura dei volumi, linee nette e sfumature morbide per valorizzare mandibola e zigomi con una scultura geometrica rigorosa ma naturale.",
      durationMinutes: 45,
      price: 3600,
      isPremium: false,
    },
    {
      name: "Executive Grooming Signature",
      description:
        "Percorso completo di taglio, barba e styling finale: un trattamento d'immagine pensato per il gentiluomo contemporaneo che pretende equilibrio assoluto.",
      durationMinutes: 75,
      price: 7200,
      isPremium: true,
    },
  ]

  await prisma.service.createMany({ data: services })

  const user = await prisma.user.create({
    data: {
      fullName: "Alessandro Venturi",
      phone: "+393491112233",
      email: "alessandro.venturi@example.com",
    },
  })

  const signatureService = await prisma.service.findUnique({
    where: { name: "Executive Grooming Signature" },
  })

  if (signatureService) {
    const start = new Date()
    start.setDate(start.getDate() + 1)
    start.setHours(10, 0, 0, 0)

    const end = new Date(start.getTime() + signatureService.durationMinutes * 60 * 1000)

    await prisma.booking.create({
      data: {
        userId: user.id,
        serviceId: signatureService.id,
        startTime: start,
        endTime: end,
        status: "CONFIRMED",
        notes: "Prima visita: preferenza per profilo classico e contorni netti.",
      },
    })
  }

  console.log("Seed premium completato con servizi, cliente e prenotazione esempio.")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
