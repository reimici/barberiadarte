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
  const selectedDateLabel = selectedDate ? format(selectedDate, 'EEEE d MMMM', { locale: it }) : ''

  return (
    <div className="w-full animate-fade-up space-y-6">
      {/* ── Week navigation ── */}
      <div className="flex items-center justify-between rounded-2xl border border-background-secondary bg-background-primary/70 px-3 py-2 shadow-[0_12px_30px_-20px_color-mix(in_srgb,var(--color-text-main)_35%,transparent)]">
        <button
          onClick={() => onWeekChange(addDays(weekStart, -7))}
          className="rounded-full border border-background-secondary bg-background-primary p-2 text-text-main transition-all duration-300 hover:border-action-primary hover:text-text-accent hover:shadow-[0_10px_20px_-12px_color-mix(in_srgb,var(--color-action-primary)_50%,transparent)]"
          aria-label="Settimana precedente"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <span className="font-body text-sm font-semibold uppercase tracking-[0.15em] text-text-main">
          {format(weekStart, 'd MMM', { locale: it })} — {format(addDays(weekStart, 6), 'd MMM yyyy', { locale: it })}
        </span>

        <button
          onClick={() => onWeekChange(addDays(weekStart, 7))}
          className="rounded-full border border-background-secondary bg-background-primary p-2 text-text-main transition-all duration-300 hover:border-action-primary hover:text-text-accent hover:shadow-[0_10px_20px_-12px_color-mix(in_srgb,var(--color-action-primary)_50%,transparent)]"
          aria-label="Settimana successiva"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* ── Day pills ── */}
      <div className="grid grid-cols-7 gap-2">
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
              className={`flex flex-col items-center rounded-2xl border px-1 py-3 text-center transition-all duration-300
                ${isDisabled
                  ? 'cursor-not-allowed border-background-secondary bg-background-primary/50 opacity-45'
                  : isSelected
                  ? 'border-action-primary bg-text-main text-background-primary shadow-[0_14px_30px_-18px_color-mix(in_srgb,var(--color-action-primary)_60%,transparent)]'
                  : 'cursor-pointer border-background-secondary bg-background-primary hover:border-action-primary hover:shadow-[0_10px_20px_-16px_color-mix(in_srgb,var(--color-text-main)_45%,transparent)]'
                }`}
            >
              <span
                className={`font-body text-xs font-bold uppercase tracking-wide ${
                  isSelected ? 'text-text-accent' : closed ? 'text-text-main/45' : 'text-text-main/70'
                }`}
              >
                {DAY_NAMES[day.getDay()]}
              </span>
              <span
                className={`mt-0.5 font-body text-base font-extrabold ${isSelected ? 'text-background-primary' : 'text-text-main'}`}
              >
                {format(day, 'd')}
              </span>
              {closed && (
                <span className="mt-0.5 font-body text-[9px] font-medium uppercase tracking-wide text-text-main/45">
                  Chiuso
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Time slots ── */}
      {selectedDate && (
        <div className="space-y-4">
          <h3 className="font-body text-sm font-semibold uppercase tracking-[0.25em] text-text-accent">
            Orari disponibili — {selectedDateLabel}
          </h3>

          {isDayClosed(selectedDate) ? (
            <p className="rounded-2xl border border-background-secondary bg-background-primary/70 py-6 text-center font-body italic text-text-main/60">
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
                    className={`rounded-xl border px-2 py-2.5 text-center font-body text-sm font-bold transition-all duration-300
                      ${!available
                        ? 'cursor-not-allowed border-background-secondary bg-background-primary/60 text-text-main/40 line-through opacity-70'
                        : isSelected
                        ? 'scale-[1.02] border-action-primary bg-action-primary text-text-main shadow-[0_14px_30px_-16px_color-mix(in_srgb,var(--color-action-primary)_60%,transparent)]'
                        : 'cursor-pointer border-background-secondary bg-background-primary text-text-main hover:border-action-primary hover:text-text-accent hover:shadow-[0_8px_18px_-12px_color-mix(in_srgb,var(--color-action-primary)_45%,transparent)]'
                      }`}
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
        <p className="rounded-2xl border border-background-secondary bg-background-primary/60 py-8 text-center font-body text-sm italic text-text-main/60">
          ← Seleziona un giorno per vedere gli orari disponibili
        </p>
      )}
    </div>
  )
}
