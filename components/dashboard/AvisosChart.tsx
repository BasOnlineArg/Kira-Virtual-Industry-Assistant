'use client'

import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, type ChartData,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface WeekStat {
  label:     string
  avisosMI:  number
  avisosMN:  number
  avisosBKL: number
  avisosPP:  number
}

interface Props { data: WeekStat[] }

export default function AvisosChart({ data }: Props) {
  const labels = data.map((d) => d.label)

  const chartData: ChartData<'bar'> = {
    labels,
    datasets: [
      {
        label:           'MI — Urgente',
        data:            data.map((d) => d.avisosMI),
        backgroundColor: 'rgba(239, 68, 68, 0.75)',
        borderRadius:    3,
        stack:           'avisos',
      },
      {
        label:           'MN — Próximo programa',
        data:            data.map((d) => d.avisosMN),
        backgroundColor: 'rgba(56, 189, 248, 0.75)',
        borderRadius:    3,
        stack:           'avisos',
      },
      {
        label:           'PP — Parada de planta',
        data:            data.map((d) => d.avisosPP),
        backgroundColor: 'rgba(167, 139, 250, 0.75)',
        borderRadius:    3,
        stack:           'avisos',
      },
      {
        label:           'BKL — Backlog',
        data:            data.map((d) => d.avisosBKL),
        backgroundColor: 'rgba(251, 191, 36, 0.75)',
        borderRadius:    3,
        stack:           'avisos',
      },
    ],
  }

  return (
    <Bar
      data={chartData}
      options={{
        responsive:          true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 12, padding: 12 },
          },
        },
        scales: {
          x: {
            stacked: true,
            ticks:   { color: '#64748b', font: { size: 10 } },
            grid:    { color: 'rgba(255,255,255,0.04)' },
          },
          y: {
            stacked:     true,
            beginAtZero: true,
            ticks:       { color: '#64748b', font: { size: 10 }, stepSize: 1 },
            grid:        { color: 'rgba(255,255,255,0.06)' },
          },
        },
      }}
    />
  )
}
