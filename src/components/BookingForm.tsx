'use client'

import { useState } from 'react'
import { z } from 'zod'
import { bookingFormSchema, type BookingFormData } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldErrors = Partial<Record<keyof BookingFormData, string>>

interface BookingFormProps {
  /** Called with validated form data on successful submission */
  onSubmit: (data: BookingFormData) => Promise<void>
  /** Whether the parent is currently processing the booking */
  isSubmitting?: boolean
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

  // Validate a single field on blur
  const validateField = (name: keyof BookingFormData, value: string) => {
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
    setValues((prev) => ({ ...prev, [name]: value }))
    // Re-validate if already touched
    if (touched[name as keyof BookingFormData]) {
      validateField(name as keyof BookingFormData, value)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    validateField(name as keyof BookingFormData, value)
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

  const fields: { name: keyof BookingFormData; label: string; type: string; placeholder: string }[] = [
    { name: 'nome',     label: 'Nome',     type: 'text', placeholder: 'Es. Mario' },
    { name: 'cognome',  label: 'Cognome',  type: 'text', placeholder: 'Es. Rossi' },
    { name: 'telefono', label: 'Telefono', type: 'tel',  placeholder: 'Es. 333 123 4567' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {fields.map(({ name, label, type, placeholder }) => (
        <div key={name}>
          <label
            htmlFor={`booking-${name}`}
            className="block text-sm font-semibold mb-1.5"
            style={{ color: 'var(--color-charcoal)' }}
          >
            {label}
          </label>
          <input
            id={`booking-${name}`}
            name={name}
            type={type}
            autoComplete={name === 'telefono' ? 'tel' : 'given-name'}
            value={values[name]}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={isSubmitting}
            className={`w-full px-4 py-3 rounded-xl border-2 text-base outline-none transition-all duration-200
              disabled:opacity-60
              ${
                errors[name] && touched[name]
                  ? 'border-red-400 bg-red-50 focus:border-red-500'
                  : 'border-stone-200 bg-white focus:border-[#D4AF37] focus:shadow-[0_0_0_3px_rgba(212,175,55,0.15)]'
              }`}
            style={{ fontFamily: 'var(--font-body)' }}
          />
          {errors[name] && touched[name] && (
            <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1.5">
              <span className="inline-block w-1 h-1 rounded-full bg-red-500 mt-px" />
              {errors[name]}
            </p>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 rounded-xl font-bold text-base tracking-wide transition-all duration-200
          flex items-center justify-center gap-2
          disabled:opacity-60 disabled:cursor-not-allowed
          hover:opacity-90 active:scale-[0.98]"
        style={{
          background: 'var(--color-gold)',
          color: 'var(--color-charcoal)',
          fontFamily: 'var(--font-body)',
          boxShadow: '0 4px 20px rgba(212,175,55,0.35)',
        }}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
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
