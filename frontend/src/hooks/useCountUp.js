import { useState, useEffect, useRef } from 'react'

/**
 * Hook qui anime un compteur de 0 vers `target` quand l’élément
 * devient visible dans le viewport (IntersectionObserver).
 *
 * @param {number} target   - Valeur finale
 * @param {number} duration - Durée de l’animation en ms (défaut : 2000)
 * @returns {{ ref, count }} - ref à attacher à l’élément, count courant
 */
export function useCountUp(target, duration = 2000) {
  const [count, setCount]   = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef(null)

  // Déclenche l’animation quand l’élément entre dans le viewport
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true) },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Lance le count-up quand started devient true
  useEffect(() => {
    if (!started) return
    const startTime = performance.now()
    const step = (now) => {
      const elapsed  = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
      else setCount(target)
    }
    requestAnimationFrame(step)
  }, [started, target, duration])

  return { ref, count }
}
