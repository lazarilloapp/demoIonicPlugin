import { IonBadge, IonIcon } from '@ionic/react'
import { flashOutline, hourglassOutline, timerOutline } from 'ionicons/icons'
import { latestPerSample, PerfSample, usePerfMetrics } from '../../contexts/PerfMetricsContext'

interface PerfBadgeProps {
  name: string
  /**
   * If provided, the badge is colored relative to this number:
   *   < threshold      → success (green)
   *   < threshold*2    → warning
   *   ≥ threshold*2    → danger
   */
  warnThresholdMs?: number
  label?: string
}

function pickColor(durationMs: number, threshold?: number): 'success' | 'warning' | 'danger' | 'medium' {
  if (threshold === undefined) return 'medium'
  if (durationMs < threshold) return 'success'
  if (durationMs < threshold * 2) return 'warning'
  return 'danger'
}

function pickIcon(durationMs: number, threshold?: number) {
  if (threshold === undefined) return timerOutline
  if (durationMs < threshold) return flashOutline
  return hourglassOutline
}

/**
 * Renders the most recent timing for `name`. If no sample has been recorded
 * yet, renders nothing — keeps the UI quiet until there's something to show.
 */
const PerfBadge: React.FC<PerfBadgeProps> = ({ name, warnThresholdMs, label }) => {
  const { samples } = usePerfMetrics()
  const latest = latestPerSample(samples).get(name)
  if (!latest) return null
  return (
    <IonBadge color={pickColor(latest.durationMs, warnThresholdMs)} className='perf-badge'>
      <IonIcon icon={pickIcon(latest.durationMs, warnThresholdMs)} />
      <span>{label ?? name}: {Math.round(latest.durationMs)} ms</span>
    </IonBadge>
  )
}

export default PerfBadge

interface PerfHistoryProps {
  name: string
  max?: number
}

/** Multiple recent samples for the same name, oldest → newest. */
export const PerfHistory: React.FC<PerfHistoryProps> = ({ name, max = 5 }) => {
  const { samples } = usePerfMetrics()
  const items: PerfSample[] = samples.filter((s) => s.name === name).slice(0, max).reverse()
  if (items.length === 0) return null
  return (
    <div className='perf-history'>
      {items.map((s) => (
        <span key={s.finishedAt} className='perf-history__chip'>{Math.round(s.durationMs)}ms</span>
      ))}
    </div>
  )
}
