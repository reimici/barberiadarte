'use client'

import { useQuery } from '@tanstack/react-query'
import { Scissors, Loader2, AlertCircle } from 'lucide-react'

type Service = {
  id: string
  name: string
  description: string
  durationMinutes: number
  priceCents: number
  isPremium: boolean
}

export default function ServiceSelector({ 
  selectedId, 
  onSelect 
}: { 
  selectedId: string | null
  onSelect: (service: Service) => void 
}) {
  const { data: services, isLoading, isError, error } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await fetch('/api/services')
      
      // 1. Validazione rigorosa dello status HTTP
      if (!res.ok) {
        // Tentiamo di estrarre il messaggio di errore dal backend
        const errorData = await res.json().catch(() => ({})); 
        throw new Error(errorData.error || 'Errore di comunicazione con il server')
      }
      
      const json = await res.json()
      
      // 2. Type Guarding: validazione strutturale a runtime
      if (!Array.isArray(json)) {
        throw new Error('Formato dati non valido: atteso un array')
      }
      
      return json
    }
  })

  // Gestione dello stato di caricamento
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-stone-500 font-medium animate-pulse">Sincronizzazione servizi...</p>
      </div>
    )
  }

  // Gestione esplicita dello stato di errore UI
  if (isError) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center text-center space-y-3 text-red-600">
          <AlertCircle className="w-10 h-10" />
          <h3 className="font-semibold text-lg">Impossibile caricare i servizi</h3>
          <p className="text-sm opacity-80">
            {error instanceof Error ? error.message : 'Verifica la connessione al database (Prisma).'}
          </p>
        </div>
      </div>
    )
  }

  // 3. Fallback di sicurezza finale
  const safeServices = Array.isArray(services) ? services : [];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-3">
        <div className="p-2 bg-amber-100 rounded-lg">
          <Scissors className="w-6 h-6 text-amber-600" />
        </div>
        Seleziona un servizio
      </h2>
      
      {safeServices.length === 0 ? (
         <div className="text-center p-8 border-2 border-dashed border-stone-200 rounded-2xl text-stone-500">
           Nessun servizio disponibile al momento.
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safeServices.map((service) => (
             <div 
               key={service.id}
               onClick={() => onSelect(service)}
               className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-lg ${
                 selectedId === service.id 
                   ? 'border-amber-500 bg-amber-50/80 shadow-md transform scale-[1.02]' 
                   : 'border-stone-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/30'
               }`}
             >
               <div>
                 <h3 className="text-lg font-bold text-stone-800">{service.name}</h3>
                 <div className="flex items-center gap-2 mt-1.5">
                   <span className="px-2.5 py-1 bg-stone-100 text-stone-600 text-xs font-semibold rounded-md">
                    {service.durationMinutes} min
                   </span>
                  {service.isPremium && (
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-md">
                      Premium
                    </span>
                  )}
                 </div>
               </div>
               <div className="text-2xl font-black text-emerald-700 tracking-tight">
                €{(service.priceCents / 100).toFixed(2)}
               </div>
             </div>
          ))}
        </div>
      )}
    </div>
  )
}