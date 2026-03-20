import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import { articles } from '../data/news.js'

function ArticleCard({ article }) {
  const isWarning = article.warning
  return (
    <Link
      to={`/news/${article.slug}`}
      className={`card p-0 overflow-hidden flex flex-col group ${
        isWarning ? 'border-red-500/40 hover:border-red-400' : ''
      }`}
    >
      <div
        className="h-40 flex items-center justify-center"
        style={{ background: article.coverColor }}
      >
        {isWarning && (
          <span className="text-red-400 text-xs uppercase tracking-widest font-bold">⚠️ Avertissement</span>
        )}
        {!isWarning && (
          <span className="text-xs uppercase tracking-widest text-gray-600 font-semibold">Image à venir</span>
        )}
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex gap-2 flex-wrap">
          {article.categories.map((cat, i) => (
            <span
              key={cat}
              className="badge"
              style={{
                background: article.categoryColors[i] + '22',
                border: `1px solid ${article.categoryColors[i]}44`,
                color: article.categoryColors[i],
              }}
            >
              {cat}
            </span>
          ))}
        </div>
        <h3 className={`font-bold text-sm leading-snug group-hover:text-violet-400 transition-colors ${
          isWarning ? 'text-red-300' : 'text-white'
        }`}>
          {article.title}
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed flex-1">{article.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-[#1e1e3a]">
          <span>{article.author}</span>
          <span>{article.date}</span>
        </div>
      </div>
    </Link>
  )
}

export default function News() {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(a => <ArticleCard key={a.slug} article={a} />)}
          </div>
        </div>
      </section>
    </div>
  )
}
