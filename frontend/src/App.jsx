import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

import Navbar    from './components/Navbar.jsx'
import Footer    from './components/Footer.jsx'
import StarField from './components/StarField.jsx'

import Home        from './pages/Home.jsx'
import About       from './pages/About.jsx'
import Guide       from './pages/Guide.jsx'
import Gallery     from './pages/Gallery.jsx'
import News        from './pages/News.jsx'
import NewsArticle from './pages/NewsArticle.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import Login       from './pages/Login.jsx'
import Register    from './pages/Register.jsx'
import Legal       from './pages/Legal.jsx'
import NotFound    from './pages/NotFound.jsx'

// Scroll en haut a chaque changement de route
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function Layout() {
  return (
    <div className="min-h-screen bg-bg-primary text-white flex flex-col">
      <StarField />
      <Navbar />
      <main className="flex-1">
        <ScrollToTop />
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/about"       element={<About />} />
          <Route path="/guide"       element={<Guide />} />
          <Route path="/gallery"     element={<Gallery />} />
          <Route path="/news"        element={<News />} />
          <Route path="/news/:slug"  element={<NewsArticle />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/legal"       element={<Legal />} />
          <Route path="*"            element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/universe-reborn">
      <Layout />
    </BrowserRouter>
  )
}
