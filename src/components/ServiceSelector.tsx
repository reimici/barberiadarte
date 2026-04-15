'use client'

import { useQuery } from '@tanstack/react-query'
import { Scissors, Loader2 } from 'lucide-react'

type Service = {
  id: string
  name: string
  duration: number
  price: number
}

export default function ServiceSelector({ 
  selectedId, 
  onSelect 
}: { 
  selectedId: string | null
  onSelect: (service: Service) => void 
}) {
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await fetch('/api/services')
      return res.json()
    }
  })

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-600" /></div>
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
        <Scissors className="text-amber-500" /> Seleziona un servizio
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services?.map((service) => (
           <div 
             key={service.id}
             onClick={() => onSelect(service)}
             className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-lg ${
               selectedId === service.id 
                 ? 'border-amber-500 bg-amber-50/50 shadow-md' 
                 : 'border-stone-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/20'
             }`}
           >
             <div>
               <h3 className="text-lg font-semibold text-stone-800">{service.name}</h3>
               <p className="text-stone-500 text-sm mt-1">{service.duration} min</p>
             </div>
             <div className="text-xl font-bold text-emerald-700">
               €{service.price}
             </div>
           </div>
        ))}
      </div>
    </div>
  )
}
