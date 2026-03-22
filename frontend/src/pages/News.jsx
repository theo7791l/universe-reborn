import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, AlertCircle, Tag } from 'lucide-react'
import PageHero from '../components/PageHero.jsx'
import api from '../api/index.js'

function ArticleCard({ article }) {
  return (
    <Link
      to={`/news/${article.slug}`}
      className="card p-0 overflow-hidden flex flex-col group hover:border-violet-500/40 transition-colors"
    >
      {/* Cover */}
      <div className="h-40 bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a] flex items-center justify-center overflow-hidden">
        {article.cover_image
          ? <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover" />
          : <Tag size={28} className="text-gray-600" />
        }
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex gap-2 flex-wrap">
          <span className="badge">{article.category}</span>
        </div>
        <h3 className="font-bold text-sm leading-snug text-white group-hover:text-violet-400 transition-colors">
          {article.title}
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed flex-1 line-clamp-3">
          {article.excerpt || 'Lire la suite…'}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-[#1e1e3a]">
          <span>{article.author_name}</span>
          <span>{article.published_at ? new Date(article.published_at).toLocaleDateString('fr-FR') : ''}</span>
        </div>
      </div>
    </Link>
  )
}

export default function News() {
  const [articles, setArticles] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [page,     setPage]     = useState(1)
  const [total,    setTotal]    = useState(0)
  const PER_PAGE = 9

  useEffect(() => {
    setLoading(true)
    setError('')
    api.get(`/api/news?page=${page}&per_page=${PER_PAGE}`)
      .then(r => { setArticles(r.data.items); setTotal(r.data.total) })
      .catch(() => setError('Impossible de charger les actualités.'))
      .finally(() => setLoading(false))
  }, [page])

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div>
      <PageHero
        titleWhite=""
        titleColored="Actualités"
        colorClass="text-orange-400"
        subtitle="Les dernières nouvelles du serveur Universe Reborn."
      />
      <section className="py-12">
        <div className="container-custom">

          {loading && (
            <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
              <Loader2 size={20} className="animate-spin" /> Chargement…
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded px-4 py-3 mb-6">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {!loading && !error && articles.length === 0 && (
            <p className="text-center text-gray-500 py-20">Aucun article publié pour l’instant.</p>
          )}

          {!loading && !error && articles.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map(a => <ArticleCard key={a.slug} article={a} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <button
                    onClick={() => setPage(p => Math.max(1, p-1))}
                    disabled={page === 1}
                    className="btn-secondary disabled:opacity-40"
                  >Précédent</button>
                  <span className="text-sm text-gray-400">Page {page} / {totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p+1))}
                    disabled={page === totalPages}
                    className="btn-secondary disabled:opacity-40"
                  >Suivant</button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
