'use client'

import { useState, useCallback, useMemo } from 'react'
import { format } from 'date-fns'
import { MOCK_APPOINTMENTS } from '@/lib/mock-data'
import type { Appointment, BookingFormData } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────
const START_HOUR = 9   // 09:00
const END_HOUR = 19    // 19:00
export const SLOT_DURATION_MINUTES = 30

// Day numbers: 0 = Sunday, 1 = Monday
export const CLOSED_DAYS = [0, 1] // Domenica e Lunedì chiusi

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Generate all time slot strings ("HH:MM") for a given day
 * from START_HOUR to END_HOUR in SLOT_DURATION_MINUTES intervals.
 */
export function generateTimeSlots(): string[] {
  const slots: string[] = []
  for (let hour = START_HOUR; hour < END_HOUR; hour++) {
    for (let min = 0; min < 60; min += SLOT_DURATION_MINUTES) {
      slots.push(`${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`)
    }
  }
  return slots
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseAppointmentsReturn {
  appointments: Appointment[]
  isLoading: boolean
  /**
   * Returns true if the given date + time slot is NOT already booked.
   *
   * ─── MIGRATION NOTE ─────────────────────────────────────────────────────────
   * In production, replace the local mock check with a real-time Supabase query:
   *
   *   const { data, error } = await supabase
   *     .from('appointments')
   *     .select('id')
   *     .eq('data', format(date, 'yyyy-MM-dd'))
   *     .eq('ora', time)
   *     .single()
   *   return !data  // available if no record found
   * ─────────────────────────────────────────────────────────────────────────────
   */
  checkAvailability: (date: Date, time: string) => boolean
  /**
   * Returns true if the given day is closed (Sunday or Monday).
   */
  isDayClosed: (date: Date) => boolean
  /**
   * Get all booked time strings for a specific date.
   */
  getBookedSlotsForDate: (date: Date) => string[]
  /**
   * Handles form submission.
   * Currently logs validated data to the console and simulates a booking.
   *
   * ─── MIGRATION NOTE ─────────────────────────────────────────────────────────
   * Replace the console.log + mock push with a real Supabase insert:
   *
   *   const { error } = await supabase.from('appointments').insert({
   *     nome: data.nome,
   *     cognome: data.cognome,
   *     telefono: data.telefono,
   *     data: format(selectedDate, 'yyyy-MM-dd'),
   *     ora: selectedTime,
   *     servizio: serviceName,
   *   })
   *   if (error) throw error
   * ─────────────────────────────────────────────────────────────────────────────
   */
  handleBooking: (
    formData: BookingFormData,
    selectedDate: Date,
    selectedTime: string,
    serviceName: string
  ) => Promise<{ success: boolean; message: string }>
}

export function useAppointments(): UseAppointmentsReturn {
  // In MVP: use local mock data. In production: fetch from Supabase.
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS)
  const [isLoading] = useState(false)

  const isDayClosed = useCallback((date: Date): boolean => {
    return CLOSED_DAYS.includes(date.getDay())
  }, [])

  const getBookedSlotsForDate = useCallback(
    (date: Date): string[] => {
      const dateStr = format(date, 'yyyy-MM-dd')
      return appointments
        .filter((a) => a.data === dateStr)
        .map((a) => a.ora)
    },
    [appointments]
  )

  const checkAvailability = useCallback(
    (date: Date, time: string): boolean => {
      if (isDayClosed(date)) return false

      const now = new Date()
      const [hour, min] = time.split(':').map(Number)
      const slotDate = new Date(date)
      slotDate.setHours(hour, min, 0, 0)

      // Slot in the past
      if (slotDate <= now) return false

      // Check against mock appointments
      const dateStr = format(date, 'yyyy-MM-dd')
      return !appointments.some((a) => a.data === dateStr && a.ora === time)
    },
    [appointments, isDayClosed]
  )

  const handleBooking = useCallback(
    async (
      formData: BookingFormData,
      selectedDate: Date,
      selectedTime: string,
      serviceName: string
    ): Promise<{ success: boolean; message: string }> => {
      const newAppointment: Appointment = {
        id: `mock-${Date.now()}`,
        createdAt: new Date().toISOString(),
        nome: formData.nome,
        cognome: formData.cognome,
        telefono: formData.telefono,
        data: format(selectedDate, 'yyyy-MM-dd'),
        ora: selectedTime,
        servizio: serviceName,
      }

      // ── CONSOLE LOG (MVP) ──────────────────────────────────────────────────
      console.log('━━━ [Barberia d\'Arte] Nuova Prenotazione ━━━')
      console.log('Cliente:', `${formData.nome} ${formData.cognome}`)
      console.log('Telefono:', formData.telefono)
      console.log('Data:', format(selectedDate, 'dd/MM/yyyy'), 'ore', selectedTime)
      console.log('Servizio:', serviceName)
      console.log('Payload completo:', newAppointment)
      console.log('━━━ [Pronto per: supabase.from("appointments").insert(payload)] ━━━')
      // ─── REPLACE ABOVE with Supabase insert in production ─────────────────

      // Simulate async operation
      await new Promise((r) => setTimeout(r, 800))

      // Update local mock state to reflect the new booking
      setAppointments((prev) => [...prev, newAppointment])

      return {
        success: true,
        message: `Appuntamento confermato per ${formData.nome} ${formData.cognome} il ${format(selectedDate, 'dd/MM/yyyy')} alle ${selectedTime}`,
      }
    },
    []
  )

  return {
    appointments,
    isLoading,
    checkAvailability,
    isDayClosed,
    getBookedSlotsForDate,
    handleBooking,
  }
}
