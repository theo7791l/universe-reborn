import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, User, Calendar } from 'lucide-react'
import { articles } from '../data/news.js'

// Rendu Markdown ultra-léger (h2, h3, gras, tableaux, listes, paragraphes)
function SimpleMarkdown({ content }) {
  const lines = content.trim().split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="font-title text-xl font-black uppercase tracking-wider text-white mt-8 mb-3">{line.slice(3)}</h2>)
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="font-bold text-white mt-6 mb-2">{line.slice(4)}</h3>)
    } else if (line.startsWith('| ')) {
      // Tableau
      const tableLines = []
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i])
        i++
      }
      const rows = tableLines.filter(l => !l.match(/^\|[-| ]+\|$/))
      elements.push(
        <div key={`table-${i}`} className="overflow-x-auto my-4">
          <table className="w-full text-sm border-collapse">
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className={ri === 0 ? 'border-b border-[#1e1e3a]' : 'border-b border-[#1e1e3a]/50'}>
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
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2))
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc list-inside space-y-1 my-3">
          {items.map((item, ii) => (
            <li key={ii} className="text-gray-300 text-sm" dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
          ))}
        </ul>
      )
      continue
    } else if (line.match(/^\d+\. /)) {
      const items = []
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(lines[i].replace(/^\d+\. /, ''))
        i++
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal list-inside space-y-1 my-3">
          {items.map((item, ii) => (
            <li key={ii} className="text-gray-300 text-sm" dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>').replace(/`(.+?)`/g, '<code class="bg-[#1e1e3a] px-1 rounded text-violet-300 text-xs">$1</code>') }} />
          ))}
        </ol>
      )
      continue
    } else if (line.trim() !== '') {
      elements.push(
        <p key={i} className="text-gray-300 text-sm leading-relaxed my-2"
          dangerouslySetInnerHTML={{
            __html: line
              .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
              .replace(/`(.+?)`/g, '<code class="bg-[#1e1e3a] px-1 rounded text-violet-300 text-xs">$1</code>')
          }}
        />
      )
    }
    i++
  }
  return <div className="prose-custom">{elements}</div>
}

export default function NewsArticle() {
  const { slug } = useParams()
  const article  = articles.find(a => a.slug === slug)

  if (!article) return <Navigate to="/news" replace />

  const related = articles.filter(a => a.slug !== slug).slice(0, 3)

  return (
    <div>
      {/* Image hero */}
      <div
        className="w-full h-64 md:h-80 flex items-center justify-center mt-16"
        style={{ background: article.coverColor }}
      >
        {article.warning && <span className="text-red-400 font-bold uppercase tracking-widest">⚠️ Avertissement</span>}
      </div>

      <div className="container-custom max-w-3xl py-12">
        {/* Retour */}
        <Link to="/news" className="flex items-center gap-2 text-sm text-gray-400 hover:text-violet-400 transition-colors mb-8">
          <ArrowLeft size={14} /> Retour aux actualités
        </Link>

        {/* Métadonnées */}
        <div className="flex gap-2 flex-wrap mb-4">
          {article.categories.map((cat, i) => (
            <span key={cat} className="badge" style={{
              background: article.categoryColors[i] + '22',
              border: `1px solid ${article.categoryColors[i]}44`,
              color: article.categoryColors[i],
            }}>{cat}</span>
          ))}
        </div>

        <h1 className="font-title text-3xl md:text-4xl font-black uppercase tracking-wide text-white leading-tight mb-6">
          {article.title}
        </h1>

        <div className="flex items-center gap-6 text-sm text-gray-400 mb-10 pb-6 border-b border-[#1e1e3a]">
          <span className="flex items-center gap-1.5"><User size={13} />{article.author}</span>
          <span className="flex items-center gap-1.5"><Calendar size={13} />{article.date}</span>
        </div>

        {/* Corps */}
        <SimpleMarkdown content={article.content} />

        {/* Articles connexes */}
        <div className="mt-16 pt-10 border-t border-[#1e1e3a]">
          <h2 className="section-title text-lg mb-6">Articles <span>Connexes</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map(a => (
              <Link key={a.slug} to={`/news/${a.slug}`} className="card p-4 group">
                <div className="flex gap-2 flex-wrap mb-2">
                  {a.categories.slice(0,1).map((cat, i) => (
                    <span key={cat} className="badge text-xs" style={{ background: a.categoryColors[i]+'22', color: a.categoryColors[i] }}>{cat}</span>
                  ))}
                </div>
                <p className="text-white text-xs font-semibold leading-snug group-hover:text-violet-400 transition-colors">{a.title}</p>
                <p className="text-gray-500 text-xs mt-1">{a.date}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
