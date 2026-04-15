'use client'

import { useState } from 'react'
import ServiceSelector from '@/components/ServiceSelector'
import BookingCalendar from '@/components/BookingCalendar'

type Service = {
  id: string
  name: string
  duration: number
  price: number
}

export default function Home() {
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  return (
    <main className="min-h-screen bg-stone-50 pb-12">
      {/* Header */}
      <header className="bg-stone-900 text-white pt-16 pb-12 px-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10,0,0,0,2,12a10,10,0,0,0,10,10,10,10,0,0,0,10-10A10,10,0,0,0,12,2ZM11,19.93A8,8,0,0,1,4.07,13H8a1,1,0,0,0,0-2H4.07A8,8,0,0,1,11,4.07v3.86a1,1,0,0,0,2,0V4.07A8,8,0,0,1,19.93,11H16a1,1,0,0,0,0,2h3.93A8,8,0,0,1,13,19.93V16a1,1,0,0,0-2,0Z"/>
          </svg>
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-sm font-semibold tracking-wide mb-6">
            PRENOTA ORA
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Barberia <span className="text-amber-500 italic font-serif">D'Arte</span>
          </h1>
          <p className="text-stone-400 text-lg md:text-xl max-w-2xl mx-auto">
            Il lusso della semplicità. Seleziona il tuo servizio e scegli l'orario perfetto per il tuo stile.
          </p>
        </div>
      </header>

      {/* Main Flow */}
      <div className="mt-8">
        <ServiceSelector 
          selectedId={selectedService?.id || null} 
          onSelect={setSelectedService} 
        />
        
        {selectedService && (
          <div className="mt-8 animate-in slide-in-from-bottom-8 fade-in duration-500">
            <BookingCalendar service={selectedService} />
          </div>
        )}
      </div>
    </main>
  )
}
