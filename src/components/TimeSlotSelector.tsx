'use client'

import { format, addDays, startOfDay, isSameDay } from 'date-fns'
import { it } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { generateTimeSlots, CLOSED_DAYS } from '@/hooks/useAppointments'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimeSlotSelectorProps {
  /** Currently selected date */
  selectedDate: Date | null
  /** Currently selected time string "HH:MM" */
  selectedTime: string | null
  /** Dates that should show as booked for the current view */
  getBookedSlotsForDate: (date: Date) => string[]
  /** Check if a slot (date+time) is available */
  checkAvailability: (date: Date, time: string) => boolean
  /** Check if a date is a closed day */
  isDayClosed: (date: Date) => boolean
  /** Week navigation start (controlled externally or by internal state) */
  weekStart: Date
  onWeekChange: (newStart: Date) => void
  onDateSelect: (date: Date) => void
  onTimeSelect: (time: string) => void
}

// ─── Constant ─────────────────────────────────────────────────────────────────

const ALL_SLOTS = generateTimeSlots()

const DAY_NAMES: Record<number, string> = {
  0: 'Dom',
  1: 'Lun',
  2: 'Mar',
  3: 'Mer',
  4: 'Gio',
  5: 'Ven',
  6: 'Sab',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TimeSlotSelector({
  selectedDate,
  selectedTime,
  getBookedSlotsForDate,
  checkAvailability,
  isDayClosed,
  weekStart,
  onWeekChange,
  onDateSelect,
  onTimeSelect,
}: TimeSlotSelectorProps) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const today = startOfDay(new Date())

  return (
    <div className="w-full">
      {/* ── Week navigation ── */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => onWeekChange(addDays(weekStart, -7))}
          className="p-2 rounded-full border-2 border-stone-200 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
          aria-label="Settimana precedente"
        >
          <ChevronLeft className="w-5 h-5 text-stone-600" />
        </button>

        <span className="font-semibold text-stone-700 text-sm tracking-wide uppercase">
          {format(weekStart, 'd MMM', { locale: it })} — {format(addDays(weekStart, 6), 'd MMM yyyy', { locale: it })}
        </span>

        <button
          onClick={() => onWeekChange(addDays(weekStart, 7))}
          className="p-2 rounded-full border-2 border-stone-200 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
          aria-label="Settimana successiva"
        >
          <ChevronRight className="w-5 h-5 text-stone-600" />
        </button>
      </div>

      {/* ── Day pills ── */}
      <div className="grid grid-cols-7 gap-1.5 mb-6">
        {days.map((day, i) => {
          const closed = isDayClosed(day)
          const isPast = day < today
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const isDisabled = closed || isPast

          return (
            <button
              key={i}
              onClick={() => !isDisabled && onDateSelect(day)}
              disabled={isDisabled}
              className={`flex flex-col items-center py-2.5 px-1 rounded-xl border-2 text-center transition-all duration-200
                ${isDisabled
                  ? 'border-stone-100 bg-stone-50 opacity-40 cursor-not-allowed'
                  : isSelected
                  ? 'border-[#D4AF37] text-white shadow-md'
                  : 'border-stone-200 bg-white hover:border-[#D4AF37]/60 hover:shadow-sm cursor-pointer'
                }`}
              style={
                isSelected
                  ? { background: '#2C2C2E', borderColor: '#D4AF37' }
                  : {}
              }
            >
              <span
                className="text-xs font-bold uppercase tracking-wide"
                style={{ color: isSelected ? '#D4AF37' : closed ? '#999' : '#666' }}
              >
                {DAY_NAMES[day.getDay()]}
              </span>
              <span
                className={`text-base font-extrabold mt-0.5 ${isSelected ? 'text-white' : 'text-stone-800'}`}
              >
                {format(day, 'd')}
              </span>
              {closed && (
                <span className="text-[9px] text-stone-400 font-medium mt-0.5 uppercase tracking-wide">
                  Chiuso
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Time slots ── */}
      {selectedDate && (
        <div>
          <h3
            className="text-sm font-semibold uppercase tracking-widest mb-3"
            style={{ color: '#D4AF37' }}
          >
            Orari disponibili — {format(selectedDate, 'EEEE d MMMM', { locale: it })}
          </h3>

          {isDayClosed(selectedDate) ? (
            <p className="text-center text-stone-400 py-6 italic">
              La barberia è chiusa questo giorno.
            </p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {ALL_SLOTS.map((time) => {
                const available = checkAvailability(selectedDate, time)
                const isSelected = selectedTime === time

                return (
                  <button
                    key={time}
                    disabled={!available}
                    onClick={() => available && onTimeSelect(time)}
                    className={`py-2.5 rounded-lg text-sm font-bold text-center border-2 transition-all duration-200
                      ${!available
                        ? 'border-stone-100 bg-stone-50 text-stone-300 cursor-not-allowed line-through opacity-70'
                        : isSelected
                        ? 'shadow-md scale-105'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-[#D4AF37] hover:text-[#2C2C2E] hover:shadow-sm cursor-pointer'
                      }`}
                    style={
                      isSelected
                        ? {
                            background: '#D4AF37',
                            borderColor: '#D4AF37',
                            color: '#2C2C2E',
                            boxShadow: '0 4px 14px rgba(212,175,55,0.4)',
                          }
                        : {}
                    }
                  >
                    {time}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <p className="text-center text-stone-400 py-8 italic text-sm">
          ← Seleziona un giorno per vedere gli orari disponibili
        </p>
      )}
    </div>
  )
}
