'use client'

import { useState } from 'react'
import { startOfDay } from 'date-fns'
import ServiceSelector from '@/components/ServiceSelector'
import TimeSlotSelector from '@/components/TimeSlotSelector'
import BookingForm from '@/components/BookingForm'
import { useAppointments } from '@/hooks/useAppointments'
import type { BookingFormData } from '@/types'

type Service = {
  id: string
  name: string
  description: string
  durationMinutes: number
  priceCents: number
  isPremium: boolean
}

// ─── Section Components ───────────────────────────────────────────────────────

function HeroSection({ onBookCta }: { onBookCta: () => void }) {
  return (
    <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden bg-text-main px-6 py-24 text-center">
      {/* Background texture overlay */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,var(--color-action-primary)_0,var(--color-action-primary)_1px,transparent_0,transparent_50%)] bg-[length:20px_20px] opacity-[0.04]" />

      {/* Decorative top line */}
      <div className="flex items-center gap-4 mb-8 animate-fade-up">
        <span className="gold-divider" />
        <span className="font-body text-xs font-semibold uppercase tracking-[0.4em] text-text-accent">
          Rimini · Fondato nel 2010
        </span>
        <span className="gold-divider" />
      </div>

      {/* Main title */}
      <h1 className="mb-4 animate-fade-up font-display text-5xl font-bold leading-tight text-background-primary md:text-7xl lg:text-8xl">
        La Barberia
        <br />
        <span className="text-luxury-shimmer italic">d&apos;Arte</span>
      </h1>

      {/* Tagline */}
      <p className="mt-6 max-w-xl animate-fade-up font-body text-lg font-light leading-relaxed text-background-primary/70 [animation-delay:120ms] md:text-xl">
        Dove la tradizione britannica incontra l&apos;artigianalità italiana.
        Ogni taglio è un&apos;opera d&apos;arte.
      </p>

      {/* CTA */}
      <div className="mt-10 animate-fade-up [animation-delay:180ms]">
        <button
          onClick={onBookCta}
          className="rounded-full border border-background-secondary bg-action-primary px-10 py-4 font-body text-base font-bold uppercase tracking-widest text-text-main transition-all duration-300 hover:scale-105 hover:shadow-[0_18px_38px_-18px_color-mix(in_srgb,var(--color-action-primary)_65%,transparent)]"
        >
          Prenota Ora
        </button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <div className="h-10 w-px bg-action-primary" />
        <span className="font-body text-[10px] uppercase tracking-[0.3em] text-text-accent">
          Scorri
        </span>
      </div>
    </section>
  )
}

function StorySection() {
  return (
    <section className="bg-background-primary px-6 py-24">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Text */}
        <div>
          <span className="mb-4 block font-body text-xs font-semibold uppercase tracking-[0.4em] text-text-accent">
            La Nostra Storia
          </span>
          <h2 className="mb-6 font-display text-4xl font-bold leading-tight text-text-main md:text-5xl">
            L&apos;arte del barbiere,{' '}
            <em className="italic text-text-accent">reinventata</em>
          </h2>
          <span className="gold-divider mb-6" />
          <p className="mb-4 font-body text-base leading-relaxed text-text-main/80">
            Ispirata alle grandi barberie di Mayfair e Jermyn Street, la Barberia d&apos;Arte porta a Rimini 
            il rigore estetico britannico, fuso con la passione e la maestria italiana.
          </p>
          <p className="font-body text-base leading-relaxed text-text-main/80">
            Ogni visita è un rituale: dalla schiuma calda alla lama affilata, dal dopobarba 
            al tocco finale — un&apos;esperienza curata in ogni dettaglio.
          </p>
        </div>

        {/* Visual quote */}
        <div className="relative overflow-hidden rounded-3xl bg-text-main p-10 text-center shadow-[0_30px_60px_-30px_color-mix(in_srgb,var(--color-text-main)_70%,transparent)]">
          <div className="absolute left-0 right-0 top-0 h-1 rounded-t-3xl bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-action-primary)_70%,transparent),var(--color-action-primary),color-mix(in_srgb,var(--color-action-primary)_70%,transparent))]" />
          <svg
            className="mx-auto mb-6 opacity-30"
            width="48" height="36" viewBox="0 0 48 36"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M0 36V22.4C0 10.667 5.333 3.2 16 0l3.2 4.8C13.067 6.933 9.6 11.2 9.6 16H16V36H0zm28 0V22.4C28 10.667 33.333 3.2 44 0l3.2 4.8C41.067 6.933 37.6 11.2 37.6 16H44V36H28z" />
          </svg>
          <p className="mb-6 font-display text-xl italic leading-relaxed text-background-primary">
            Un gentiluomo si riconosce dalla cura di sé.
            Il barbiere ne è il primo custode.
          </p>
          <span className="font-body text-sm font-semibold uppercase tracking-widest text-text-accent">
            — Domenico, Maestro Barbiere
          </span>
        </div>
      </div>
    </section>
  )
}

// ─── Main Booking Flow Section ────────────────────────────────────────────────

function BookingSection({ bookingSectionRef }: { bookingSectionRef: React.RefObject<HTMLElement | null> }) {
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [weekStart, setWeekStart] = useState(() => startOfDay(new Date()))
  const [bookingState, setBookingState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [successMessage, setSuccessMessage] = useState('')

  const { checkAvailability, isDayClosed, getBookedSlotsForDate, handleBooking } = useAppointments()

  const canShowSlots = !!selectedService
  const canShowForm = canShowSlots && !!selectedDate && !!selectedTime

  const handleFormSubmit = async (formData: BookingFormData) => {
    if (!selectedDate || !selectedTime || !selectedService) return
    setBookingState('submitting')
    try {
      const result = await handleBooking(formData, selectedDate, selectedTime, selectedService.id, selectedService.name)
      if (result.success) {
        setBookingState('success')
        setSuccessMessage(result.message)
        // Reset after a brief delay
        setTimeout(() => {
          setSelectedService(null)
          setSelectedDate(null)
          setSelectedTime(null)
          setBookingState('idle')
          setSuccessMessage('')
        }, 5000)
      }
    } catch {
      setBookingState('error')
    }
  }

  return (
    <section
      ref={bookingSectionRef}
      id="prenota"
      className="bg-text-main px-6 py-24"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="mb-4 block font-body text-xs font-semibold uppercase tracking-[0.4em] text-text-accent">
            Prenota il Tuo Appuntamento
          </span>
          <h2 className="font-display text-4xl font-bold text-background-primary md:text-5xl">
            Scegli il tuo <em className="text-luxury-shimmer italic">servizio</em>
          </h2>
          <span className="gold-divider mx-auto mt-5" />
        </div>

        {/* Success State */}
        {bookingState === 'success' ? (
          <div className="mx-auto max-w-lg rounded-3xl border border-background-secondary bg-background-primary/10 p-12 text-center shadow-[0_28px_54px_-30px_color-mix(in_srgb,var(--color-action-primary)_55%,transparent)]">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-action-primary bg-background-primary/10">
              <svg
                className="w-10 h-10"
                viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="mb-3 font-display text-2xl font-bold text-background-primary">
              Prenotazione Confermata!
            </h3>
            <p className="font-body text-sm leading-relaxed text-background-primary/75">
              {successMessage}
            </p>
            <p className="mt-4 font-body text-xs text-text-accent">
              Riceverai una conferma. A presto!
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Step 1: Service */}
            <div className="rounded-3xl border border-background-secondary bg-background-primary/10 p-8 shadow-[0_24px_48px_-30px_color-mix(in_srgb,var(--color-text-main)_80%,transparent)]">
              <StepLabel number={1} label="Scegli il Servizio" />
              <div className="mt-6">
                <ServiceSelector
                  selectedId={selectedService?.id ?? null}
                  onSelect={(s) => {
                    setSelectedService(s)
                    setSelectedDate(null)
                    setSelectedTime(null)
                  }}
                />
              </div>
            </div>

            {/* Step 2: Date & Time */}
            {canShowSlots && (
              <div className="animate-fade-up rounded-3xl border border-background-secondary bg-background-primary/10 p-8 shadow-[0_24px_48px_-30px_color-mix(in_srgb,var(--color-text-main)_80%,transparent)]">
                <StepLabel number={2} label="Scegli Data e Orario" />
                <div className="mt-6">
                  <TimeSlotSelector
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    getBookedSlotsForDate={getBookedSlotsForDate}
                    checkAvailability={checkAvailability}
                    isDayClosed={isDayClosed}
                    weekStart={weekStart}
                    onWeekChange={setWeekStart}
                    onDateSelect={(d) => { setSelectedDate(d); setSelectedTime(null) }}
                    onTimeSelect={setSelectedTime}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Customer data */}
            {canShowForm && (
              <div className="animate-fade-up rounded-3xl border border-background-secondary bg-background-primary/10 p-8 shadow-[0_24px_48px_-30px_color-mix(in_srgb,var(--color-text-main)_80%,transparent)]">
                <StepLabel number={3} label="I Tuoi Dati" />
                <div className="mt-6 max-w-md">
                  <BookingForm
                    onSubmit={handleFormSubmit}
                    isSubmitting={bookingState === 'submitting'}
                  />
                  {bookingState === 'error' && (
                    <p className="mt-4 rounded-xl border border-background-secondary bg-background-primary/10 px-4 py-3 text-center font-body text-sm text-text-accent">
                      Si è verificato un errore. Riprova.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function StepLabel({ number, label }: { number: number; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-background-secondary bg-action-primary font-body text-sm font-bold text-text-main shadow-[0_10px_20px_-12px_color-mix(in_srgb,var(--color-action-primary)_60%,transparent)]">
        {number}
      </div>
      <h3 className="font-display text-xl font-bold text-background-primary">
        {label}
      </h3>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const bookingSectionRef: React.RefObject<HTMLElement | null> = { current: null }

  const scrollToBooking = () => {
    document.getElementById('prenota')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-background-primary">
      <HeroSection onBookCta={scrollToBooking} />
      <StorySection />
      <BookingSection bookingSectionRef={bookingSectionRef} />

      {/* Footer */}
      <footer className="bg-text-main py-8 text-center font-body text-xs uppercase tracking-widest text-background-primary/40">
        © {new Date().getFullYear()} La Barberia d&apos;Arte · Rimini ·{' '}
        <span className="text-text-accent">Since 2010</span>
      </footer>
    </main>
  )
}
