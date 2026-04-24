'use client'

import { useState } from 'react'
import { bookingFormSchema, type BookingFormData } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldErrors = Partial<Record<keyof BookingFormData, string>>

interface BookingFormProps {
  /** Called with validated form data on successful submission */
  onSubmit: (data: BookingFormData) => Promise<void>
  /** Whether the parent is currently processing the booking */
  isSubmitting?: boolean
}

type BookingField = keyof BookingFormData

interface BookingFieldConfig {
  name: BookingField
  label: string
  type: 'text' | 'tel'
  placeholder: string
  autoComplete: React.HTMLInputAutoCompleteAttribute
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BookingForm({ onSubmit, isSubmitting = false }: BookingFormProps) {
  const [values, setValues] = useState<BookingFormData>({
    nome: '',
    cognome: '',
    telefono: '',
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof BookingFormData, boolean>>>({})

  const fields: BookingFieldConfig[] = [
    { name: 'nome', label: 'Nome', type: 'text', placeholder: 'Es. Domenico', autoComplete: 'given-name' },
    { name: 'cognome', label: 'Cognome', type: 'text', placeholder: 'Es. Moretti', autoComplete: 'family-name' },
    { name: 'telefono', label: 'Telefono', type: 'tel', placeholder: 'Es. 333 123 4567', autoComplete: 'tel' },
  ]

  // Validazione granulare: feedback istantaneo, senza attendere submit globale.
  const validateField = (name: BookingField, value: string) => {
    const result = bookingFormSchema.safeParse({ ...values, [name]: value })
    if (!result.success) {
      const fieldError = result.error.flatten().fieldErrors[name]
      setErrors((prev) => ({ ...prev, [name]: fieldError?.[0] ?? undefined }))
    } else {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const fieldName = name as BookingField
    setValues((prev) => ({ ...prev, [fieldName]: value }))
    // Re-validate if already touched
    if (touched[fieldName]) {
      validateField(fieldName, value)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const fieldName = name as BookingField
    setTouched((prev) => ({ ...prev, [fieldName]: true }))
    validateField(fieldName, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Touch all fields to show errors
    setTouched({ nome: true, cognome: true, telefono: true })

    const result = bookingFormSchema.safeParse(values)
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors
      setErrors({
        nome: flat.nome?.[0],
        cognome: flat.cognome?.[0],
        telefono: flat.telefono?.[0],
      })
      return
    }

    setErrors({})
    await onSubmit(result.data)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-fade-up space-y-6 rounded-3xl border border-background-secondary bg-background-primary/70 p-8 shadow-[0_18px_50px_-20px_color-mix(in_srgb,var(--color-text-main)_30%,transparent)] backdrop-blur-sm"
      noValidate
      aria-label="Dati cliente per prenotazione rituale d'arte"
    >
      <header className="space-y-2">
        <p className="font-body text-xs uppercase tracking-[0.35em] text-text-accent">Ritualita d&apos;Arte</p>
        <h4 className="font-display text-2xl text-text-main">I Tuoi Dati</h4>
      </header>

      <div className="space-y-6">
        {fields.map(({ name, label, type, placeholder, autoComplete }) => {
          const hasError = Boolean(errors[name] && touched[name])
          const errorId = `booking-${name}-error`

          return (
            <div key={name} className="space-y-2">
              <label htmlFor={`booking-${name}`} className="block font-body text-sm font-semibold text-text-main">
                {label}
              </label>
              <input
                id={`booking-${name}`}
                name={name}
                type={type}
                autoComplete={autoComplete}
                value={values[name]}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                disabled={isSubmitting}
                aria-invalid={hasError}
                aria-describedby={errorId}
                className={[
                  'w-full rounded-2xl border px-4 py-3 font-body text-base text-text-main placeholder:text-text-main/45',
                  'bg-background-primary transition-all duration-300 outline-none',
                  'focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-action-primary)_24%,transparent)]',
                  'disabled:cursor-not-allowed disabled:opacity-60',
                  hasError
                    ? 'border-text-accent shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-text-accent)_45%,transparent)]'
                    : 'border-background-secondary focus:border-action-primary',
                ].join(' ')}
              />
              <p
                id={errorId}
                role="status"
                aria-live="polite"
                className={[
                  'min-h-5 overflow-hidden font-body text-sm text-text-accent transition-all duration-300',
                  hasError ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
                ].join(' ')}
              >
                {hasError ? errors[name] : ' '}
              </p>
            </div>
          )
        })}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-background-secondary bg-action-primary px-6 py-4 font-body text-sm font-bold uppercase tracking-[0.2em] text-text-main transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-12px_color-mix(in_srgb,var(--color-action-primary)_45%,transparent)] active:translate-y-0 disabled:translate-y-0 disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Conferma in corso...
          </>
        ) : (
          'Conferma Appuntamento'
        )}
      </button>
    </form>
  )
}
