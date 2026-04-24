import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// Core Domain Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Appointment {
  id: string
  createdAt: string         // ISO 8601
  nome: string
  cognome: string
  telefono: string
  data: string              // "YYYY-MM-DD"
  ora: string               // "HH:MM" (es. "10:30")
  servizio: string          // nome del servizio
}

export interface Service {
  id: string
  name: string
  duration: number          // minuti
  price: number
}

export interface TimeSlot {
  time: string              // "HH:MM"
  available: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Zod Schema — Validazione Form Prenotazione
// ─────────────────────────────────────────────────────────────────────────────

export const bookingFormSchema = z.object({
  nome: z
    .string()
    .min(2, 'Il nome deve avere almeno 2 caratteri')
    .max(50, 'Il nome è troppo lungo')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Inserisci un nome valido'),

  cognome: z
    .string()
    .min(2, 'Il cognome deve avere almeno 2 caratteri')
    .max(50, 'Il cognome è troppo lungo')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Inserisci un cognome valido'),

  telefono: z
    .string()
    .min(9, 'Numero di telefono troppo corto')
    .max(15, 'Numero di telefono troppo lungo')
    .regex(
      /^(\+39|0039)?[\s.-]?3\d{2}[\s.-]?\d{6,7}$|^(\+39|0039)?[\s.-]?0\d{1,4}[\s.-]?\d{4,8}$/,
      'Inserisci un numero di telefono italiano valido (es. 333 123 4567)'
    ),
})

export type BookingFormData = z.infer<typeof bookingFormSchema>

// ─────────────────────────────────────────────────────────────────────────────
// API / DB Types (compatibili con Prisma Booking model)
// ─────────────────────────────────────────────────────────────────────────────

export interface BookingDB {
  id: string
  startTime: string
  endTime: string
  customerName: string
  customerPhone: string
  serviceId: string
  status: 'ACTIVE' | 'CANCELLED'
  service: {
    name: string
    price: number
  }
  createdAt: string
}
