import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const p = await params;
    const id = p.id;
    
    if (!id) {
      return NextResponse.json({ error: 'ID non fornito' }, { status: 400 })
    }

    // Soft delete or hard delete. Let's do hard delete for simplicity, or set status to CANCELLED.
    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Errore durante l\'eliminazione' }, { status: 500 })
  }
}
