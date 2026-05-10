import { MapPin, Construction } from 'lucide-react'

export default function GeolocationPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <MapPin className="w-5 h-5 text-sky-400" />
          <h1 className="text-2xl font-semibold text-slate-100">Geolocalización</h1>
        </div>
        <p className="text-slate-400 text-sm">
          Vista satelital superficie (Leaflet + Esri) + planos subterráneos calibrados. 4 minas.
          Pins Verde / Amarillo / Rojo.
        </p>
      </div>
      <div className="kira-card flex flex-col items-center justify-center min-h-[55vh] text-center p-8">
        <Construction className="w-10 h-10 text-slate-600 mb-4" />
        <h2 className="text-slate-300 font-medium mb-1">Módulo 7 — En desarrollo</h2>
        <p className="text-slate-500 text-sm max-w-sm">
          Minas: Mariana Central / Mariana Norte / Emilia / San Marcos. Alta de activo: click en mapa → form
          → pin inmediato. Panel detalle con historial desde Supabase.
        </p>
        <span className="mt-4 px-3 py-1 text-xs bg-slate-800 text-slate-400 border border-slate-700 rounded-full">
          Planificado
        </span>
      </div>
    </div>
  )
}
