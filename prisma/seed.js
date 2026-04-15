const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const count = await prisma.service.count();
  if (count === 0) {
    await prisma.service.createMany({
      data: [
        { name: 'Taglio Capelli', duration: 30, price: 20 },
        { name: 'Regolazione Barba', duration: 30, price: 15 },
        { name: 'Taglio + Barba', duration: 60, price: 30 },
        { name: 'Sfumatura Razor', duration: 30, price: 25 },
        { name: 'Colore / Trattamento', duration: 60, price: 40 },
      ],
    })
    console.log("Services seeded");
  } else {
    console.log("Services already seeded");
  }
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
