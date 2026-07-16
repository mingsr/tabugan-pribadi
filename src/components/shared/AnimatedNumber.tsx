import { useEffect, useRef } from 'react'
import { animate, useMotionValue, useTransform } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  /** Format akhir, mis. `rp` dari lib/format.ts. Default: pembulatan biasa. */
  format?: (value: number) => string
  /** Durasi animasi dalam detik. Default 0.8s. */
  duration?: number
  className?: string
}

/**
 * AnimatedNumber — count-up animation, dipakai Dashboard & Statistik untuk
 * nominal Rupiah/angka (§4 Reusable Component). Animasi lari dari 0 (atau
 * dari nilai sebelumnya) menuju `value` setiap kali `value` berubah.
 */
export function AnimatedNumber({ value, format, duration = 0.8, className }: AnimatedNumberProps) {
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (latest) => Math.round(latest))
  const spanRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: 'easeOut',
    })
    return controls.stop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  useEffect(() => {
    return rounded.on('change', (latest) => {
      if (spanRef.current) {
        spanRef.current.textContent = format ? format(latest) : String(latest)
      }
    })
  }, [rounded, format])

  return (
    <span ref={spanRef} className={className}>
      {format ? format(0) : '0'}
    </span>
  )
}
