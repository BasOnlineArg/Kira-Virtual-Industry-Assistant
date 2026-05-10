'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  LogarithmicScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
  type ChartData,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { ImageDown, Loader2 } from 'lucide-react'
import type { AudioMetrics } from '@/lib/dsp/processor'

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  LogarithmicScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
)

/* ─── shared chart options factory ──────────────────────────── */
function baseOptions(xLabel: string, yLabel: string, logY = false): ChartOptions<'line'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#94a3b8',
        bodyColor: '#e2e8f0',
        borderColor: '#334155',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        type: 'linear',
        title: { display: true, text: xLabel, color: '#64748b', font: { size: 10 } },
        ticks: { color: '#64748b', maxTicksLimit: 8, font: { size: 9 } },
        grid: { color: '#1e293b' },
      },
      y: {
        type: logY ? 'logarithmic' : 'linear',
        title: { display: true, text: yLabel, color: '#64748b', font: { size: 10 } },
        ticks: { color: '#64748b', maxTicksLimit: 6, font: { size: 9 } },
        grid: { color: '#1e293b' },
      },
    },
  }
}

/* ─── downsample helper ──────────────────────────────────────── */
function downsampleXY(xs: number[], ys: number[], maxPts: number) {
  if (xs.length <= maxPts) return xs.map((x, i) => ({ x, y: ys[i] }))
  const step = Math.ceil(xs.length / maxPts)
  const pts: { x: number; y: number }[] = []
  for (let i = 0; i < xs.length; i += step) pts.push({ x: xs[i], y: ys[i] })
  return pts
}

/* ─── chart data builders ────────────────────────────────────── */
function twfData(metrics: AudioMetrics): ChartData<'line'> {
  return {
    datasets: [{
      data: downsampleXY(metrics.twf.times, metrics.twf.amplitudes, 2000),
      borderColor: '#38bdf8', borderWidth: 1, pointRadius: 0, tension: 0, fill: false,
    }],
  }
}

function fftData(metrics: AudioMetrics): ChartData<'line'> {
  return {
    datasets: [{
      data: downsampleXY(metrics.fftSpectrum.frequencies, metrics.fftSpectrum.magnitudesDb, 1500),
      borderColor: '#a78bfa', borderWidth: 1, pointRadius: 0, tension: 0,
      fill: { target: 'origin', above: 'rgba(167,139,250,0.07)' },
    }],
  }
}

function psdData(metrics: AudioMetrics): ChartData<'line'> {
  return {
    datasets: [{
      data: downsampleXY(metrics.psd.frequencies, metrics.psd.powerDb.map((v) => Math.max(v, 1e-12)), 1200),
      borderColor: '#34d399', borderWidth: 1, pointRadius: 0, tension: 0,
      fill: { target: 'origin', above: 'rgba(52,211,153,0.07)' },
    }],
  }
}

function aeaData(metrics: AudioMetrics): ChartData<'line'> {
  return {
    datasets: [{
      data: downsampleXY(metrics.aeaEnvelope.times, metrics.aeaEnvelope.levels, 1500),
      borderColor: '#f97316', borderWidth: 1, pointRadius: 0, tension: 0,
      fill: { target: 'origin', above: 'rgba(249,115,22,0.1)' },
    }],
  }
}

/* ─── Spectrogram (canvas) ───────────────────────────────────── */
function SpectrogramCanvas({
  metrics,
  canvasRef,
}: {
  metrics: AudioMetrics
  canvasRef: React.RefObject<HTMLCanvasElement>
}) {
  useEffect(() => {
    const canvas = canvasRef.current
    const mags = metrics.spectrogram?.magnitudes
    if (!canvas || !mags || mags.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const nFrames = mags.length
    const nBins = mags[0].length
    canvas.width = nFrames
    canvas.height = nBins

    let minDb = Infinity, maxDb = -Infinity
    for (const frame of mags) for (const v of frame) {
      if (v < minDb) minDb = v
      if (v > maxDb) maxDb = v
    }
    const range = maxDb - minDb || 1
    const imgData = ctx.createImageData(nFrames, nBins)

    for (let t = 0; t < nFrames; t++) {
      for (let f = 0; f < nBins; f++) {
        const norm = (mags[t][f] - minDb) / range
        let r = 0, g = 0, b = 0
        if (norm < 0.25)      { r = 0;   g = 0;   b = Math.round(norm * 4 * 200 + 55) }
        else if (norm < 0.5)  { r = 0;   g = Math.round((norm - 0.25) * 4 * 255); b = 200 }
        else if (norm < 0.75) { r = Math.round((norm - 0.5) * 4 * 255); g = 255; b = 0 }
        else                  { r = 255; g = Math.round(255 - (norm - 0.75) * 4 * 255); b = 0 }
        const row = nBins - 1 - f
        const idx = (row * nFrames + t) * 4
        imgData.data[idx] = r; imgData.data[idx + 1] = g
        imgData.data[idx + 2] = b; imgData.data[idx + 3] = 255
      }
    }
    ctx.putImageData(imgData, 0, 0)
  }, [metrics.spectrogram, canvasRef])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}

/* ─── Main export ────────────────────────────────────────────── */
export default function DspCharts({ metrics }: { metrics: AudioMetrics }) {
  const [exporting, setExporting] = useState(false)

  // Chart.js instance refs
  const twfRef  = useRef<ChartJS<'line'> | null>(null)
  const fftRef  = useRef<ChartJS<'line'> | null>(null)
  const psdRef  = useRef<ChartJS<'line'> | null>(null)
  const aeaRef  = useRef<ChartJS<'line'> | null>(null)
  const spectroCanvasRef = useRef<HTMLCanvasElement>(null)

  const hasSpectrogram = !!metrics.spectrogram?.magnitudes?.length

  /* ─── Export all charts as JPGs in a ZIP ── */
  async function handleExportJpgs() {
    setExporting(true)
    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      const chartEntries: { name: string; ref: React.RefObject<ChartJS<'line'> | null> }[] = [
        { name: '01_TWF_forma_de_onda', ref: twfRef },
        { name: '02_FFT_espectro',      ref: fftRef },
        { name: '03_PSD_Welch',         ref: psdRef },
        { name: '04_AEA_envolvente',    ref: aeaRef },
      ]

      for (const { name, ref } of chartEntries) {
        const chart = ref.current
        if (!chart) continue
        // toBase64Image returns a data URL like "data:image/jpeg;base64,..."
        const dataUrl = chart.toBase64Image('image/jpeg', 0.92)
        const base64 = dataUrl.split(',')[1]
        zip.file(`${name}.jpg`, base64, { base64: true })
      }

      // Spectrogram canvas
      if (hasSpectrogram && spectroCanvasRef.current) {
        const dataUrl = spectroCanvasRef.current.toDataURL('image/jpeg', 0.92)
        const base64 = dataUrl.split(',')[1]
        zip.file('05_Espectrograma_STFT.jpg', base64, { base64: true })
      }

      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `graficas_DSP_${new Date().toISOString().slice(0, 10)}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header + export button */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gráficas DSP</p>
        <button
          onClick={handleExportJpgs}
          disabled={exporting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 border border-slate-700
                     text-slate-300 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          {exporting
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Exportando…</>
            : <><ImageDown className="w-3.5 h-3.5" />Exportar JPGs (ZIP)</>
          }
        </button>
      </div>

      {/* TWF */}
      <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Forma de onda temporal (TWF)
        </p>
        <div className="h-36">
          <Line ref={twfRef} data={twfData(metrics)} options={baseOptions('Tiempo (s)', 'Amplitud')} />
        </div>
      </div>

      {/* FFT + PSD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Espectro FFT
          </p>
          <div className="h-36">
            <Line ref={fftRef} data={fftData(metrics)} options={baseOptions('Frecuencia (Hz)', 'Magnitud (dB)')} />
          </div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            PSD Welch
          </p>
          <div className="h-36">
            <Line ref={psdRef} data={psdData(metrics)} options={baseOptions('Frecuencia (Hz)', 'PSD (dB/Hz)', true)} />
          </div>
        </div>
      </div>

      {/* AEA */}
      <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
          AEA — Envolvente &gt;2 kHz
        </p>
        <div className="h-36">
          <Line ref={aeaRef} data={aeaData(metrics)} options={baseOptions('Tiempo (s)', 'AEA Envolvente')} />
        </div>
      </div>

      {/* Spectrogram */}
      {hasSpectrogram && (
        <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Espectrograma (STFT)
          </p>
          <div className="h-40 w-full">
            <SpectrogramCanvas metrics={metrics} canvasRef={spectroCanvasRef} />
          </div>
          <div className="flex justify-between text-[9px] text-slate-600 mt-1">
            <span>0 Hz</span>
            <span>{(metrics.sampleRate / 2).toLocaleString()} Hz</span>
          </div>
        </div>
      )}
    </div>
  )
}
