'use client'

// ─── Mock admin guard ─────────────────────────────────────────────────────────
// MVP: isAdmin è sempre true. In produzione, sostituire con una vera verifica
// di sessione (es. Supabase Auth: const { data: { session } } = await supabase.auth.getSession())
// e controllare il ruolo dell'utente nella tabella 'profiles'.
const isAdmin = true

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import { Trash2, Calendar, Loader2, Scissors } from 'lucide-react'

type Booking = {
  id: string
  startTime: string
  endTime: string
  customerName: string
  customerPhone: string
  service: {
    name: string
    priceCents: number
  }
}

export default function AdminDashboard() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [rangeDays, setRangeDays] = useState<1 | 7 | 30 | 90 | 0>(30)
  
  const queryClient = useQueryClient()

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ['admin-bookings', rangeDays],
    queryFn: async () => {
      const from = format(new Date(), 'yyyy-MM-dd')
      const to = rangeDays === 0 ? '' : format(new Date(Date.now() + (rangeDays - 1) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
      const url = to ? `/api/bookings?from=${from}&to=${to}` : `/api/bookings?from=${from}`

      const res = await fetch(url)
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error ?? 'Errore nel caricamento prenotazioni')
      }
      const payload = await res.json()
      return Array.isArray(payload) ? payload : []
    },
    // isAdmin guard: in MVP è sempre true, in produzione verificare sessione Supabase
    enabled: isAuthenticated && isAdmin,
    refetchInterval: 5000
  })

  const totalCents = bookings.reduce((sum, booking) => sum + booking.service.priceCents, 0)
  const totalEuro = (totalCents / 100).toFixed(2)

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    }
  })

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Hardcoded password for MVP as requested implicitly for extreme simplicity
    if (password === 'admin123') {
      setIsAuthenticated(true)
    } else {
      alert('Password errata')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-text-main p-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm animate-fade-up rounded-3xl border border-background-secondary bg-background-primary/10 p-10 shadow-[0_26px_52px_-30px_color-mix(in_srgb,var(--color-text-main)_80%,transparent)]"
        >
          <div className="flex justify-center mb-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-action-primary bg-background-primary/10">
              <Scissors className="h-8 w-8 text-text-accent" />
            </div>
          </div>
          <h1 className="mb-1 text-center font-display text-3xl font-bold text-background-primary">
            La Barberia d&apos;Arte
          </h1>
          <p className="mb-8 text-center font-body text-sm text-background-primary/50">
            Area Riservata — Solo Domenico
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full rounded-2xl border border-background-secondary bg-background-primary/10 px-4 py-3 font-body text-base text-background-primary placeholder:text-background-primary/50 outline-none transition-all duration-300 focus:border-action-primary focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-action-primary)_25%,transparent)]"
            placeholder="Password"
          />
          <button
            type="submit"
            className="w-full rounded-2xl border border-background-secondary bg-action-primary py-3.5 font-body text-base font-bold tracking-wide text-text-main transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_color-mix(in_srgb,var(--color-action-primary)_65%,transparent)]"
          >
            Accedi
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-primary p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between rounded-2xl bg-text-main p-6 shadow-[0_20px_40px_-26px_color-mix(in_srgb,var(--color-text-main)_80%,transparent)]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-background-secondary bg-background-primary/10">
              <Calendar className="h-6 w-6 text-text-accent" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-background-primary">
                Gestione Appuntamenti
              </h1>
              <p className="font-body text-sm text-background-primary/50">
                Barberia d&apos;Arte · {rangeDays === 1 ? 'solo oggi' : rangeDays === 0 ? 'tutti i futuri (incluso oggi)' : `oggi + prossimi ${rangeDays - 1} giorni`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={rangeDays}
              onChange={(e) => setRangeDays(Number(e.target.value) as 1 | 7 | 30 | 90 | 0)}
              className="rounded-lg border border-background-secondary bg-background-primary/10 px-3 py-2 font-body text-sm font-semibold text-background-primary outline-none transition-all duration-300 focus:border-action-primary"
              aria-label="Intervallo giorni dashboard"
            >
              <option value={1}>Solo oggi</option>
              <option value={7}>Prossimi 7 giorni</option>
              <option value={30}>Prossimi 30 giorni</option>
              <option value={90}>Prossimi 90 giorni</option>
              <option value={0}>Tutti i futuri (incluso oggi)</option>
            </select>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="rounded-lg border border-background-secondary px-4 py-2 font-body text-sm font-semibold text-text-accent transition-all duration-300 hover:bg-background-primary/10"
            >
              Esci
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-background-secondary bg-background-primary p-5 shadow-[0_12px_24px_-16px_color-mix(in_srgb,var(--color-text-main)_40%,transparent)]">
            <p className="font-body text-xs uppercase tracking-[0.2em] text-text-accent">Prenotazioni nel periodo</p>
            <p className="mt-2 font-display text-3xl text-text-main">{bookings.length}</p>
          </div>
          <div className="rounded-2xl border border-background-secondary bg-background-primary p-5 shadow-[0_12px_24px_-16px_color-mix(in_srgb,var(--color-text-main)_40%,transparent)]">
            <p className="font-body text-xs uppercase tracking-[0.2em] text-text-accent">Valore totale periodo</p>
            <p className="mt-2 font-display text-3xl text-text-main">€ {totalEuro}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-background-secondary bg-background-primary shadow-[0_16px_34px_-24px_color-mix(in_srgb,var(--color-text-main)_45%,transparent)]">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-text-accent" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center font-body text-text-main/60">
              Nessun appuntamento in programma.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-text-main text-background-primary">
                    <th className="p-4 font-body text-sm font-semibold">Data e Ora</th>
                    <th className="p-4 font-body text-sm font-semibold">Cliente</th>
                    <th className="p-4 font-body text-sm font-semibold">Servizio</th>
                    <th className="p-4 text-right font-body text-sm font-semibold">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-background-secondary">
                  {bookings.map((b) => {
                    const date = parseISO(b.startTime)
                    return (
                      <tr key={b.id} className="transition-colors duration-300 hover:bg-background-secondary/40">
                        <td className="p-4">
                          <div className="font-body font-semibold text-text-main">
                            {format(date, 'HH:mm')}
                          </div>
                          <div className="font-body text-sm capitalize text-text-main/60">
                            {format(date, 'EEEE d MMM', { locale: it })}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-body font-semibold text-text-main">{b.customerName}</div>
                          <div className="font-body text-sm text-text-main/60">{b.customerPhone}</div>
                        </td>
                        <td className="p-4">
                          <div className="inline-block rounded-full border border-background-secondary bg-action-primary/15 px-3 py-1 font-body text-sm font-medium text-text-main">
                            {b.service.name}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              if (confirm('Vuoi davvero annullare questo appuntamento?')) {
                                cancelMutation.mutate(b.id)
                              }
                            }}
                            disabled={cancelMutation.isPending}
                            className="rounded-lg p-2 text-text-main/55 transition-all duration-300 hover:bg-background-secondary hover:text-text-accent disabled:opacity-50"
                            title="Annulla prenotazione"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
