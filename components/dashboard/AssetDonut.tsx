'use client'

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Props {
  operativos:      number
  enMantenimiento: number
  fueraDeServicio: number
}

export default function AssetDonut({ operativos, enMantenimiento, fueraDeServicio }: Props) {
  const total = operativos + enMantenimiento + fueraDeServicio

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-600 text-sm">
        Sin activos registrados
      </div>
    )
  }

  return (
    <div className="relative">
      <Doughnut
        data={{
          labels:   ['Operativo', 'En mantenimiento', 'Fuera de servicio'],
          datasets: [{
            data:            [operativos, enMantenimiento, fueraDeServicio],
            backgroundColor: ['rgba(52, 211, 153, 0.8)', 'rgba(251, 191, 36, 0.8)', 'rgba(239, 68, 68, 0.8)'],
            borderColor:     ['rgba(52, 211, 153, 1)',   'rgba(251, 191, 36, 1)',   'rgba(239, 68, 68, 1)'  ],
            borderWidth:     2,
            hoverOffset:     6,
          }],
        }}
        options={{
          responsive:          true,
          maintainAspectRatio: true,
          cutout:              '68%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color:    '#94a3b8',
                font:     { size: 11 },
                boxWidth: 12,
                padding:  12,
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const pct = Math.round((ctx.parsed / total) * 100)
                  return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`
                },
              },
            },
          },
        }}
      />
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
           style={{ paddingBottom: '40px' }}>
        <p className="text-2xl font-bold text-slate-100">{total}</p>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider">activos</p>
      </div>
    </div>
  )
}
