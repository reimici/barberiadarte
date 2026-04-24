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
import { Trash2, Lock, Calendar, Loader2, Scissors } from 'lucide-react'

type Booking = {
  id: string
  startTime: string
  endTime: string
  customerName: string
  customerPhone: string
  service: {
    name: string
    price: number
  }
}

export default function AdminDashboard() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  const queryClient = useQueryClient()

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const res = await fetch('/api/bookings')
      return res.json()
    },
    // isAdmin guard: in MVP è sempre true, in produzione verificare sessione Supabase
    enabled: isAuthenticated && isAdmin,
    refetchInterval: 5000
  })

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
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#2C2C2E' }}>
        <form
          onSubmit={handleLogin}
          className="p-10 rounded-3xl w-full max-w-sm"
          style={{ background: 'rgba(245,241,225,0.06)', border: '1px solid rgba(212,175,55,0.2)' }}
        >
          <div className="flex justify-center mb-8">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(212,175,55,0.15)', border: '2px solid #D4AF37' }}
            >
              <Scissors className="w-8 h-8" style={{ color: '#D4AF37' }} />
            </div>
          </div>
          <h1
            className="font-display text-3xl font-bold text-center mb-1"
            style={{ color: '#F5F1E1' }}
          >
            La Barberia d&apos;Arte
          </h1>
          <p className="text-center text-sm mb-8" style={{ color: 'rgba(245,241,225,0.4)' }}>
            Area Riservata — Solo Domenico
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 outline-none mb-4 text-base transition-all"
            style={{
              background: 'rgba(245,241,225,0.08)',
              borderColor: 'rgba(212,175,55,0.3)',
              color: '#F5F1E1',
              fontFamily: 'var(--font-body)',
            }}
            placeholder="Password"
          />
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl font-bold text-base tracking-wide transition-all hover:opacity-90"
            style={{ background: '#D4AF37', color: '#2C2C2E', fontFamily: 'var(--font-body)' }}
          >
            Accedi
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: '#F5F1E1' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div
          className="flex items-center justify-between mb-8 p-6 rounded-2xl"
          style={{ background: '#2C2C2E' }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}
            >
              <Calendar className="w-6 h-6" style={{ color: '#D4AF37' }} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold" style={{ color: '#F5F1E1' }}>
                Gestione Appuntamenti
              </h1>
              <p className="text-sm" style={{ color: 'rgba(245,241,225,0.45)' }}>
                Barberia d&apos;Arte · Dashboard
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 text-sm font-semibold rounded-lg border transition-all hover:opacity-80"
            style={{ border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}
          >
            Esci
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 2px 24px rgba(44,44,46,0.08)', border: '1px solid rgba(44,44,46,0.08)' }}>
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#D4AF37' }} />
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center" style={{ color: '#888' }}>
              Nessun appuntamento in programma.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ background: '#2C2C2E', color: '#F5F1E1' }}>
                    <th className="p-4 font-semibold text-sm">Data e Ora</th>
                    <th className="p-4 font-semibold text-sm">Cliente</th>
                    <th className="p-4 font-semibold text-sm">Servizio</th>
                    <th className="p-4 font-semibold text-sm text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {bookings.map((b) => {
                    const date = parseISO(b.startTime)
                    return (
                      <tr key={b.id} className="hover:bg-stone-50 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-stone-800">
                            {format(date, 'HH:mm')}
                          </div>
                          <div className="text-sm text-stone-500 capitalize">
                            {format(date, 'EEEE d MMM', { locale: it })}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-stone-800">{b.customerName}</div>
                          <div className="text-sm text-stone-500">{b.customerPhone}</div>
                        </td>
                        <td className="p-4">
                          <div
                            className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                            style={{ background: 'rgba(212,175,55,0.12)', color: '#2C2C2E', border: '1px solid rgba(212,175,55,0.3)' }}
                          >
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
                            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
