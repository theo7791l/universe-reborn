import { useEffect, useRef } from 'react'

export default function StarField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId

    const STAR_COUNT = 180
    const stars = []

    function resize() {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }

    function initStars() {
      stars.length = 0
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x:       Math.random() * canvas.width,
          y:       Math.random() * canvas.height,
          radius:  Math.random() * 1.4 + 0.2,
          speed:   Math.random() * 0.25 + 0.05,
          opacity: Math.random() * 0.6 + 0.2,
        })
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const s of stars) {
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${s.opacity})`
        ctx.fill()
        s.y += s.speed
        if (s.y > canvas.height) {
          s.y = 0
          s.x = Math.random() * canvas.width
        }
      }
      animId = requestAnimationFrame(draw)
    }

    resize()
    initStars()
    draw()

    window.addEventListener('resize', () => { resize(); initStars() })
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} id="starfield-canvas" />
}
