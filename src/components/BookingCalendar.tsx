'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, addDays, startOfDay, addMinutes, isBefore, isSameDay, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

type Booking = {
  id: string
  startTime: string
  endTime: string
  serviceId: string
  status: string
}

type Service = {
  id: string
  name: string
  duration: number
}

// Generate an array of 7 days starting from today
const getNextDays = (startDate: Date) => {
  return Array.from({ length: 7 }).map((_, i) => addDays(startDate, i))
}

const START_HOUR = 9 // 09:00
const END_HOUR = 19 // 19:00
const SLOT_DURATION = 30 // minutes

// Generate slots for a given day
const getSlotsForDay = (day: Date) => {
  const slots = []
  let current = new Date(day)
  current.setHours(START_HOUR, 0, 0, 0)
  
  const endOfDay = new Date(day)
  endOfDay.setHours(END_HOUR, 0, 0, 0)

  while (isBefore(current, endOfDay)) {
    slots.push(new Date(current))
    current = addMinutes(current, SLOT_DURATION)
  }
  return slots
}

export default function BookingCalendar({ service }: { service: Service }) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfDay(new Date()))
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null)
  
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  
  const [modalOpen, setModalOpen] = useState(false)
  const queryClient = useQueryClient()

  // Fetch bookings spanning current week
  const endDateStr = format(addDays(currentWeekStart, 7), "yyyy-MM-dd'T'HH:mm:ssxxx")
  
  // We can fetch all bookings globally since it's small, or pass some dates.
  // The API doesn't filter perfectly by week if no date param, it brings all right now if date is undef.
  // We will just fetch all active bookings to be safe and simple for polling.
  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: async () => {
      const res = await fetch('/api/bookings') // returns all ACTIVE
      return res.json()
    }
  })

  const createBookingMutation = useMutation({
    mutationFn: async (slot: Date) => {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: slot.toISOString(),
          endTime: addMinutes(slot, service.duration).toISOString(),
          customerName,
          customerPhone,
          serviceId: service.id
        })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Errore durante la prenotazione')
      }
      return res.json()
    },
    onSuccess: () => {
      setModalOpen(false)
      setSelectedSlot(null)
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      alert('Prenotazione confermata con successo!')
    },
    onError: (err: any) => {
      alert(err.message)
      queryClient.invalidateQueries({ queryKey: ['bookings'] }) // refresh slots
    }
  })

  const days = getNextDays(currentWeekStart)
  const now = new Date()

  const isSlotAvailable = (slotStartTime: Date) => {
    if (isBefore(slotStartTime, now)) return false // Past slot

    const slotEndTime = addMinutes(slotStartTime, service.duration)
    
    // Check if slot falls out of boundary
    const slotEndBoundary = new Date(slotStartTime)
    slotEndBoundary.setHours(END_HOUR, 0, 0, 0)
    if (slotEndTime > slotEndBoundary) return false // would exceed closing time

    // Check overlaps
    return !bookings.some(booking => {
      const bStart = parseISO(booking.startTime)
      const bEnd = parseISO(booking.endTime)
      return (slotStartTime < bEnd && slotEndTime > bStart)
    })
  }

  const handleSlotClick = (slot: Date) => {
    if (!isSlotAvailable(slot)) return
    setSelectedSlot(slot)
    setModalOpen(true)
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-6">
        <button 
          onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
          className="p-2 border border-stone-200 rounded-full hover:bg-stone-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-stone-600" />
        </button>
        <span className="font-semibold text-lg text-stone-800">
          Seleziona un orario
        </span>
        <button 
          onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
          className="p-2 border border-stone-200 rounded-full hover:bg-stone-100 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-stone-600" />
        </button>
      </div>

      <div className="w-full overflow-x-auto pb-4">
        <div className="flex space-x-4 min-w-max">
          {days.map((day, i) => {
            const slots = getSlotsForDay(day)
            return (
              <div key={i} className="flex flex-col items-center space-y-3 w-32 shrink-0">
                <div className="bg-stone-900 text-stone-50 py-3 px-4 w-full rounded-xl text-center shadow-lg">
                  <div className="text-xs uppercase tracking-wider text-amber-500 font-bold">
                    {format(day, 'EEEE', { locale: it })}
                  </div>
                  <div className="text-xl font-light">
                    {format(day, 'd MMM')}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 w-full pt-2">
                  {slots.map((slot, j) => {
                    const available = isSlotAvailable(slot)
                    const isSelected = selectedSlot && slot.getTime() === selectedSlot.getTime()

                    return (
                      <button
                        key={j}
                        disabled={!available}
                        onClick={() => handleSlotClick(slot)}
                        className={`py-3 px-2 rounded-lg text-center text-sm font-semibold transition-all duration-200 
                          ${!available ? 'bg-stone-200 text-stone-400 cursor-not-allowed opacity-60' 
                          : isSelected ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-600 ring-offset-2' 
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-500 hover:text-white shadow-sm border border-emerald-100 hover:shadow-md'
                          }`}
                      >
                        {format(slot, 'HH:mm')}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      {modalOpen && selectedSlot && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-stone-900 p-6 text-center relative text-white">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold">Conferma Appuntamento</h3>
              <p className="text-stone-300 mt-1">
                {format(selectedSlot, "EEEE d MMMM 'alle' HH:mm", { locale: it })}
              </p>
              <div className="mt-3 inline-block bg-stone-800 px-4 py-1.5 rounded-full border border-stone-700 text-amber-400 text-sm font-medium">
                {service.name} ({service.duration} min)
              </div>
            </div>
            
            <form 
              className="p-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                createBookingMutation.mutate(selectedSlot)
              }}
            >
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Nome e Cognome</label>
                <input 
                  required
                  type="text" 
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                  placeholder="Es. Mario Rossi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Numero di Telefono</label>
                <input 
                  required
                  type="tel" 
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                  placeholder="Es. 333 123 4567"
                />
              </div>

              {createBookingMutation.isError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Errore: {createBookingMutation.error?.message}</span>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-stone-100">
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl font-semibold transition-colors"
                >
                  Annulla
                </button>
                <button 
                  type="submit"
                  disabled={createBookingMutation.isPending}
                  className="flex-1 py-3 text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold shadow-md shadow-emerald-600/20 disabled:opacity-70 transition-all flex justify-center items-center"
                >
                  {createBookingMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Conferma Ora'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
