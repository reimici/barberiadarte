import type { Appointment } from '@/types'

/**
 * Mock appointments simulating existing bookings in the database.
 * These are used by `checkAvailability` to disable occupied slots.
 *
 * ─── MIGRATION NOTE ───────────────────────────────────────────────────────────
 * Replace this array with a real Supabase query when going live:
 *
 *   const { data, error } = await supabase
 *     .from('appointments')
 *     .select('*')
 *     .eq('data', dateString)
 *
 * See `useAppointments.ts` for the exact integration points.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'mock-001',
    createdAt: '2026-04-24T09:00:00.000Z',
    nome: 'Luca',
    cognome: 'Ferrari',
    telefono: '333 111 2222',
    data: '2026-04-25',
    ora: '10:00',
    servizio: 'Taglio Classico',
  },
  {
    id: 'mock-002',
    createdAt: '2026-04-24T09:30:00.000Z',
    nome: 'Marco',
    cognome: 'Rossi',
    telefono: '347 555 6677',
    data: '2026-04-25',
    ora: '11:00',
    servizio: 'Taglio + Barba',
  },
  {
    id: 'mock-003',
    createdAt: '2026-04-24T10:00:00.000Z',
    nome: 'Giorgio',
    cognome: 'Bianchi',
    telefono: '320 998 8776',
    data: '2026-04-28',
    ora: '14:30',
    servizio: 'Rasatura Tradizionale',
  },
  {
    id: 'mock-004',
    createdAt: '2026-04-24T11:00:00.000Z',
    nome: 'Antonio',
    cognome: 'Conti',
    telefono: '348 123 4321',
    data: '2026-04-29',
    ora: '09:00',
    servizio: 'Taglio Classico',
  },
]
