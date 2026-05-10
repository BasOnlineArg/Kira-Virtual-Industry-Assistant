'use client'

import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, Tooltip, Legend, type ChartData,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend)

interface WeekStat {
  label:       string
  hhProg:      number
  hhr:         number
  otCumplidas: number
  otCount:     number
}

interface Props { data: WeekStat[] }

export default function WeeklyChart({ data }: Props) {
  const labels = data.map((d) => d.label)

  const chartData: ChartData<'bar'> = {
    labels,
    datasets: [
      {
        label:           'HH Programadas',
        data:            data.map((d) => d.hhProg),
        backgroundColor: 'rgba(56, 189, 248, 0.6)',   // sky
        borderColor:     'rgba(56, 189, 248, 0.9)',
        borderWidth:     1,
        borderRadius:    4,
        barPercentage:   0.45,
      },
      {
        label:           'HHR Reales',
        data:            data.map((d) => d.hhr),
        backgroundColor: 'rgba(52, 211, 153, 0.6)',   // emerald
        borderColor:     'rgba(52, 211, 153, 0.9)',
        borderWidth:     1,
        borderRadius:    4,
        barPercentage:   0.45,
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
            labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 12, padding: 16 },
          },
          tooltip: {
            callbacks: {
              afterBody: (items) => {
                const i   = items[0].dataIndex
                const pct = data[i].hhProg > 0
                  ? Math.round((data[i].hhr / data[i].hhProg) * 100)
                  : 0
                return [`Eficiencia: ${pct}%`, `OTs: ${data[i].otCumplidas}/${data[i].otCount} cumplidas`]
              },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: '#64748b', font: { size: 10 } },
            grid:  { color: 'rgba(255,255,255,0.04)' },
          },
          y: {
            ticks: { color: '#64748b', font: { size: 10 } },
            grid:  { color: 'rgba(255,255,255,0.06)' },
            beginAtZero: true,
          },
        },
      }}
    />
  )
}
