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
  duration: number
  price: number
}

// ─── Section Components ───────────────────────────────────────────────────────

function HeroSection({ onBookCta }: { onBookCta: () => void }) {
  return (
    <section
      className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden"
      style={{ background: '#2C2C2E' }}
    >
      {/* Background texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            #D4AF37 0,
            #D4AF37 1px,
            transparent 0,
            transparent 50%
          )`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Decorative top line */}
      <div className="flex items-center gap-4 mb-8 animate-fade-up">
        <span className="gold-divider" />
        <span
          className="text-xs tracking-[0.4em] uppercase font-semibold"
          style={{ color: '#D4AF37' }}
        >
          Rimini · Fondato nel 2010
        </span>
        <span className="gold-divider" />
      </div>

      {/* Main title */}
      <h1
        className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-4 animate-fade-up"
        style={{ color: '#F5F1E1' }}
      >
        La Barberia
        <br />
        <span className="italic text-shimmer">d&apos;Arte</span>
      </h1>

      {/* Tagline */}
      <p
        className="mt-6 text-lg md:text-xl max-w-xl mx-auto leading-relaxed animate-fade-up-delay"
        style={{ color: 'rgba(245,241,225,0.65)', fontWeight: 300 }}
      >
        Dove la tradizione britannica incontra l&apos;artigianalità italiana.
        Ogni taglio è un&apos;opera d&apos;arte.
      </p>

      {/* CTA */}
      <div className="mt-10 animate-fade-up-delay">
        <button
          onClick={onBookCta}
          className="px-10 py-4 text-base font-bold tracking-widest uppercase rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          style={{
            background: '#D4AF37',
            color: '#2C2C2E',
            boxShadow: '0 8px 30px rgba(212,175,55,0.4)',
          }}
        >
          Prenota Ora
        </button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <div className="w-px h-10" style={{ background: '#D4AF37' }} />
        <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: '#D4AF37' }}>
          Scorri
        </span>
      </div>
    </section>
  )
}

function StorySection() {
  return (
    <section className="py-24 px-6" style={{ background: '#F5F1E1' }}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Text */}
        <div>
          <span
            className="text-xs tracking-[0.4em] uppercase font-semibold mb-4 block"
            style={{ color: '#D4AF37' }}
          >
            La Nostra Storia
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-6" style={{ color: '#2C2C2E' }}>
            L&apos;arte del barbiere,{' '}
            <em className="italic" style={{ color: '#1A4314' }}>reinventata</em>
          </h2>
          <span className="gold-divider mb-6" />
          <p className="text-base leading-relaxed mb-4" style={{ color: '#2C2C2E', opacity: 0.75 }}>
            Ispirata alle grandi barberie di Mayfair e Jermyn Street, la Barberia d&apos;Arte porta a Rimini 
            il rigore estetico britannico, fuso con la passione e la maestria italiana.
          </p>
          <p className="text-base leading-relaxed" style={{ color: '#2C2C2E', opacity: 0.75 }}>
            Ogni visita è un rituale: dalla schiuma calda alla lama affilata, dal dopobarba 
            al tocco finale — un&apos;esperienza curata in ogni dettaglio.
          </p>
        </div>

        {/* Visual quote */}
        <div
          className="rounded-3xl p-10 text-center relative overflow-hidden"
          style={{ background: '#2C2C2E' }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
            style={{ background: 'linear-gradient(90deg, #D4AF37, #f5d87b, #D4AF37)' }}
          />
          <svg
            className="mx-auto mb-6 opacity-30"
            width="48" height="36" viewBox="0 0 48 36"
            fill="#D4AF37"
          >
            <path d="M0 36V22.4C0 10.667 5.333 3.2 16 0l3.2 4.8C13.067 6.933 9.6 11.2 9.6 16H16V36H0zm28 0V22.4C28 10.667 33.333 3.2 44 0l3.2 4.8C41.067 6.933 37.6 11.2 37.6 16H44V36H28z" />
          </svg>
          <p
            className="font-display text-xl italic leading-relaxed mb-6"
            style={{ color: '#F5F1E1' }}
          >
            Un gentiluomo si riconosce dalla cura di sé.
            Il barbiere ne è il primo custode.
          </p>
          <span
            className="text-sm tracking-widest uppercase"
            style={{ color: '#D4AF37', fontWeight: 600 }}
          >
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
      const result = await handleBooking(formData, selectedDate, selectedTime, selectedService.name)
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
      className="py-24 px-6"
      style={{ background: '#2C2C2E' }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span
            className="text-xs tracking-[0.4em] uppercase font-semibold mb-4 block"
            style={{ color: '#D4AF37' }}
          >
            Prenota il Tuo Appuntamento
          </span>
          <h2
            className="font-display text-4xl md:text-5xl font-bold"
            style={{ color: '#F5F1E1' }}
          >
            Scegli il tuo <em className="italic text-shimmer">servizio</em>
          </h2>
          <span className="gold-divider mx-auto mt-5" />
        </div>

        {/* Success State */}
        {bookingState === 'success' ? (
          <div
            className="rounded-3xl p-12 text-center max-w-lg mx-auto"
            style={{ background: '#1A4314', border: '1px solid rgba(212,175,55,0.3)' }}
          >
            <div
              className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6"
              style={{ background: 'rgba(212,175,55,0.15)', border: '2px solid #D4AF37' }}
            >
              <svg
                className="w-10 h-10"
                viewBox="0 0 24 24" fill="none"
                stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="font-display text-2xl font-bold mb-3" style={{ color: '#F5F1E1' }}>
              Prenotazione Confermata!
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,241,225,0.7)' }}>
              {successMessage}
            </p>
            <p className="mt-4 text-xs" style={{ color: '#D4AF37' }}>
              Riceverai una conferma. A presto!
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Step 1: Service */}
            <div
              className="rounded-3xl p-8"
              style={{ background: 'rgba(245,241,225,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}
            >
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
              <div
                className="rounded-3xl p-8 animate-fade-up"
                style={{ background: 'rgba(245,241,225,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}
              >
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
              <div
                className="rounded-3xl p-8 animate-fade-up"
                style={{ background: 'rgba(245,241,225,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}
              >
                <StepLabel number={3} label="I Tuoi Dati" />
                <div className="mt-6 max-w-md">
                  <BookingForm
                    onSubmit={handleFormSubmit}
                    isSubmitting={bookingState === 'submitting'}
                  />
                  {bookingState === 'error' && (
                    <p className="mt-4 text-sm text-red-400 text-center">
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
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
        style={{ background: '#D4AF37', color: '#2C2C2E' }}
      >
        {number}
      </div>
      <h3 className="font-display text-xl font-bold" style={{ color: '#F5F1E1' }}>
        {label}
      </h3>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const bookingSectionRef = { current: null as HTMLElement | null }

  const scrollToBooking = () => {
    document.getElementById('prenota')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen" style={{ background: '#F5F1E1' }}>
      <HeroSection onBookCta={scrollToBooking} />
      <StorySection />
      <BookingSection bookingSectionRef={bookingSectionRef} />

      {/* Footer */}
      <footer
        className="py-8 text-center text-xs tracking-widest uppercase"
        style={{ background: '#2C2C2E', color: 'rgba(245,241,225,0.35)' }}
      >
        © {new Date().getFullYear()} La Barberia d&apos;Arte · Rimini ·{' '}
        <span style={{ color: '#D4AF37' }}>Since 2010</span>
      </footer>
    </main>
  )
}
