import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react'

/**
 * One observed sample of an in-app latency: how long an operation labelled
 * `name` took. We keep the start time around for callers that need to compute
 * a delta in two phases (markStart + markEnd) without bookkeeping themselves.
 */
export interface PerfSample {
  name: string
  durationMs: number
  finishedAt: number
}

interface PerfMetricsContextValue {
  samples: PerfSample[]
  markStart: (name: string) => void
  markEnd: (name: string) => number | undefined
  record: (name: string, durationMs: number) => void
  reset: (name?: string) => void
}

const PerfMetricsContext = createContext<PerfMetricsContextValue | undefined>(undefined)

interface ProviderProps {
  children: ReactNode
}

/**
 * Lightweight perf store for the demo. Components call `markStart` when they
 * trigger an interesting operation (e.g. tapping "open map") and `markEnd`
 * when it completes (e.g. inside the `onMapReady` callback). The newest
 * samples render through <PerfBadge /> so the user sees the impact of cache
 * vs cold runs without reading logs.
 */
export const PerfMetricsProvider: React.FC<ProviderProps> = ({ children }) => {
  const [samples, setSamples] = useState<PerfSample[]>([])
  const pending = useRef<Map<string, number>>(new Map())

  const markStart = useCallback((name: string) => {
    pending.current.set(name, performance.now())
  }, [])

  const record = useCallback((name: string, durationMs: number) => {
    setSamples((prev) => [{ name, durationMs, finishedAt: Date.now() }, ...prev].slice(0, 30))
  }, [])

  const markEnd = useCallback(
    (name: string) => {
      const startedAt = pending.current.get(name)
      if (startedAt === undefined) return undefined
      pending.current.delete(name)
      const durationMs = performance.now() - startedAt
      record(name, durationMs)
      return durationMs
    },
    [record]
  )

  const reset = useCallback((name?: string) => {
    if (name) {
      setSamples((prev) => prev.filter((s) => s.name !== name))
      pending.current.delete(name)
    } else {
      setSamples([])
      pending.current.clear()
    }
  }, [])

  const value = useMemo(
    () => ({ samples, markStart, markEnd, record, reset }),
    [samples, markStart, markEnd, record, reset]
  )

  return <PerfMetricsContext.Provider value={value}>{children}</PerfMetricsContext.Provider>
}

export function usePerfMetrics(): PerfMetricsContextValue {
  const ctx = useContext(PerfMetricsContext)
  if (!ctx) {
    throw new Error('usePerfMetrics must be used within a PerfMetricsProvider')
  }
  return ctx
}

/** Filter to the most recent sample per metric name. */
export function latestPerSample(samples: PerfSample[]): Map<string, PerfSample> {
  const out = new Map<string, PerfSample>()
  for (const s of samples) {
    if (!out.has(s.name)) out.set(s.name, s)
  }
  return out
}
