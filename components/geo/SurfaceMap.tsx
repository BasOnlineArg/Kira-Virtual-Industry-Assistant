'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { STATUS_COLORS, SURFACE_CENTER, SURFACE_ZOOM } from '@/lib/geo/constants'
import type { Asset } from '@/lib/geo/types'

// ── Helpers ────────────────────────────────────────────────────────────────

function makeDivIcon(color: string, selected: boolean): L.DivIcon {
  const size  = selected ? 28 : 22
  const border = selected ? '#ffffff' : 'rgba(255,255,255,0.75)'
  const shadow = selected
    ? `0 0 0 3px ${color}55, 0 4px 12px rgba(0,0,0,0.5)`
    : '0 2px 6px rgba(0,0,0,0.4)'

  return L.divIcon({
    className: '',
    iconSize:  [size, size],
    iconAnchor:[size / 2, size],
    popupAnchor:[0, -size],
    html: `
      <div style="
        width: ${size}px; height: ${size}px;
        border-radius: 50% 50% 50% 0;
        background-color: ${color};
        border: 2.5px solid ${border};
        box-shadow: ${shadow};
        transform: rotate(-45deg);
        transition: all 0.15s;
      "></div>`,
  })
}

// ── Pan-to controller ───────────────────────────────────────────────────────

function PanTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], Math.max(map.getZoom(), 18), { animate: true })
  }, [lat, lng, map])
  return null
}

// ── Main component ──────────────────────────────────────────────────────────

interface SurfaceMapProps {
  assets:       Asset[]
  selectedId:   string | null
  onSelect:     (asset: Asset) => void
  placeMode?:   boolean
  onMapClick?:  (lat: number, lng: number) => void
}

export default function SurfaceMap({ assets, selectedId, onSelect, placeMode, onMapClick }: SurfaceMapProps) {
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const mapRef     = useRef<L.Map | null>(null)

  const selected = assets.find((a) => a.id === selectedId)

  // Sync markers whenever assets / selection changes
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const current = markersRef.current
    const ids      = new Set(assets.map((a) => a.id))

    // Remove stale markers
    current.forEach((m, id) => {
      if (!ids.has(id)) { m.remove(); current.delete(id) }
    })

    // Add / update markers
    assets.forEach((asset) => {
      if (asset.lat == null || asset.lng == null) return
      const isSelected = asset.id === selectedId
      const color      = STATUS_COLORS[asset.status] ?? '#94a3b8'
      const icon       = makeDivIcon(color, isSelected)

      let marker = current.get(asset.id)
      if (!marker) {
        marker = L.marker([asset.lat, asset.lng], { icon })
          .addTo(map)
          .on('click', () => onSelect(asset))
        current.set(asset.id, marker)
      } else {
        marker.setIcon(icon)
      }

      // Popup
      marker.bindPopup(`
        <div style="border-radius:8px;min-width:140px">
          <p style="font-weight:700;font-size:13px;margin:0 0 2px">${asset.nombre}</p>
          <p style="font-family:monospace;font-size:10px;color:#64748b;margin:0">${asset.tag}</p>
        </div>
      `, { closeButton: false, offset: [0, -8] })
    })
  }, [assets, selectedId, onSelect])

  return (
    <div className="relative w-full h-full" style={{ cursor: placeMode ? 'crosshair' : undefined }}>
      <MapContainer
        center={SURFACE_CENTER}
        zoom={SURFACE_ZOOM}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        ref={(m) => { if (m) mapRef.current = m }}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri"
          maxZoom={20}
        />

        {/* Zoom control positioned bottom-right */}
        <ZoomControl />

        {/* Pan to selected */}
        {selected?.lat != null && selected?.lng != null && (
          <PanTo lat={selected.lat} lng={selected.lng} />
        )}

        {/* Place mode click handler */}
        {placeMode && onMapClick && (
          <ClickHandler onMapClick={onMapClick} />
        )}
      </MapContainer>

      {/* Layer badge */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5 px-2.5 py-1 rounded-full
                      bg-slate-900/90 border border-slate-700/60 backdrop-blur-sm text-[10px] text-slate-300 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Vista satelital · Superficie
      </div>
    </div>
  )
}

// ── Click handler for place mode ────────────────────────────────────────────

function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onMapClick(e.latlng.lat, e.latlng.lng) } })
  return null
}

// ── Custom zoom control (bottom-right) ──────────────────────────────────────

function ZoomControl() {
  const map = useMap()
  return (
    <div className="leaflet-bottom leaflet-right" style={{ zIndex: 1000 }}>
      <div className="leaflet-control flex flex-col gap-1 m-3">
        {[
          { label: '+', action: () => map.zoomIn()  },
          { label: '−', action: () => map.zoomOut() },
          { label: '⌂', action: () => map.setView(SURFACE_CENTER, SURFACE_ZOOM) },
        ].map(({ label, action }) => (
          <button
            key={label}
            onClick={action}
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       bg-slate-900/90 border border-slate-700/60 text-slate-300
                       hover:bg-slate-800 hover:text-white transition-colors text-sm font-bold
                       backdrop-blur-sm shadow-lg"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
