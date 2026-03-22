import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Calendar, Loader2, AlertCircle } from 'lucide-react'
import api from '../api/index.js'

// Rendu Markdown léger (h2, h3, listes, tableaux, gras, code)
function SimpleMarkdown({ content }) {
  if (!content) return null
  const lines    = content.trim().split('\n')
  const elements = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="font-title text-xl font-black uppercase tracking-wider text-white mt-8 mb-3">{line.slice(3)}</h2>)
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="font-bold text-white mt-6 mb-2">{line.slice(4)}</h3>)
    } else if (line.startsWith('| ')) {
      const tableLines = []
      while (i < lines.length && lines[i].startsWith('|')) { tableLines.push(lines[i]); i++ }
      const rows = tableLines.filter(l => !l.match(/^\|[-| ]+\|$/))
      elements.push(
        <div key={`t${i}`} className="overflow-x-auto my-4">
          <table className="w-full text-sm border-collapse">
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-b border-[#1e1e3a]">
                  {row.split('|').filter((_, ci) => ci > 0 && ci < row.split('|').length - 1).map((cell, ci) => (
                    ri === 0
                      ? <th key={ci} className="px-3 py-2 text-left text-xs uppercase tracking-wider text-gray-400 font-bold">{cell.trim()}</th>
                      : <td key={ci} className="px-3 py-2 text-gray-300">{cell.trim()}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      continue
    } else if (line.startsWith('- ')) {
      const items = []
      while (i < lines.length && lines[i].startsWith('- ')) { items.push(lines[i].slice(2)); i++ }
      elements.push(
        <ul key={`ul${i}`} className="list-disc list-inside space-y-1 my-3">
          {items.map((item, ii) => (
            <li key={ii} className="text-gray-300 text-sm"
              dangerouslySetInnerHTML={{ __html: item
                .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
                .replace(/`(.+?)`/g, '<code class="bg-[#1e1e3a] px-1 rounded text-violet-300 text-xs">$1</code>') }} />
          ))}
        </ul>
      )
      continue
    } else if (line.trim() !== '') {
      elements.push(
        <p key={i} className="text-gray-300 text-sm leading-relaxed my-2"
          dangerouslySetInnerHTML={{ __html: line
            .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
            .replace(/`(.+?)`/g, '<code class="bg-[#1e1e3a] px-1 rounded text-violet-300 text-xs">$1</code>') }}
        />
      )
    }
    i++
  }
  return <div>{elements}</div>
}

export default function NewsArticle() {
  const { slug }   = useParams()
  const navigate   = useNavigate()
  const [article, setArticle] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    api.get(`/api/news/${slug}`)
      .then(r => {
        setArticle(r.data)
        // Charger des articles connexes
        return api.get('/api/news?per_page=4')
      })
      .then(r => setRelated((r.data.items || []).filter(a => a.slug !== slug).slice(0, 3)))
      .catch(err => {
        if (err.response?.status === 404) navigate('/news', { replace: true })
        else setError('Impossible de charger l’article.')
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center gap-3 text-gray-400">
      <Loader2 size={24} className="animate-spin" /> Chargement…
    </div>
  )

  if (error) return (
    <div className="container-custom max-w-3xl py-20">
      <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 rounded px-4 py-3">
        <AlertCircle size={15} /> {error}
      </div>
    </div>
  )

  if (!article) return null

  return (
    <div>
      <div className="w-full h-64 md:h-80 flex items-center justify-center mt-16 bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a] overflow-hidden">
        {article.cover_image
          ? <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover" />
          : <span className="text-gray-600 text-sm uppercase tracking-widest">Image à venir</span>
        }
      </div>

      <div className="container-custom max-w-3xl py-12">
        <Link to="/news" className="flex items-center gap-2 text-sm text-gray-400 hover:text-violet-400 transition-colors mb-8">
          <ArrowLeft size={14} /> Retour aux actualités
        </Link>

        <div className="flex gap-2 mb-4">
          <span className="badge">{article.category}</span>
        </div>

        <h1 className="font-title text-3xl md:text-4xl font-black uppercase tracking-wide text-white leading-tight mb-6">
          {article.title}
        </h1>

        <div className="flex items-center gap-6 text-sm text-gray-400 mb-10 pb-6 border-b border-[#1e1e3a]">
          <span className="flex items-center gap-1.5"><User size={13} />{article.author_name}</span>
          <span className="flex items-center gap-1.5">
            <Calendar size={13} />
            {article.published_at ? new Date(article.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
          </span>
        </div>

        <SimpleMarkdown content={article.content} />

        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[#1e1e3a]">
            <h2 className="section-title text-lg mb-6">Articles <span>Connexes</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map(a => (
                <Link key={a.slug} to={`/news/${a.slug}`} className="card p-4 group">
                  <span className="badge text-xs mb-2 block">{a.category}</span>
                  <p className="text-white text-xs font-semibold leading-snug group-hover:text-violet-400 transition-colors">{a.title}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {a.published_at ? new Date(a.published_at).toLocaleDateString('fr-FR') : ''}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
