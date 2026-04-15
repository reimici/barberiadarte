'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'
import { Trash2, Lock, Calendar, Loader2 } from 'lucide-react'

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
    enabled: isAuthenticated,
    refetchInterval: 5000 // Poll every 5s for new bookings
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
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm animate-in fade-in zoom-in-95">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-stone-800 mb-6">Area Riservata</h2>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 mb-4 focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="Inserisci password"
          />
          <button 
            type="submit"
            className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors"
          >
            Accedi
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 flex items-center gap-3">
              <Calendar className="text-emerald-500 w-8 h-8" />
              Gestione Appuntamenti
            </h1>
            <p className="text-stone-500 mt-1">Visualizza e gestisci le prenotazioni della barberia.</p>
          </div>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 text-sm font-semibold text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-100"
          >
            Esci
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center text-stone-500">
              Nessun appuntamento in programma.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-900 text-stone-100">
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
                          <div className="inline-block bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium border border-emerald-100">
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
