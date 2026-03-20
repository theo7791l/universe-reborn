// Hero générique pour les sous-pages (About, Guide, Gallery…)
export default function PageHero({ titleWhite, titleColored, subtitle, colorClass = 'text-violet-400' }) {
  return (
    <section className="relative pt-32 pb-16 text-center">
      <div className="container-custom">
        <h1 className="font-title text-5xl md:text-6xl font-black uppercase tracking-widest mb-4 animate-fade-in-up">
          {titleWhite && <span className="text-white">{titleWhite} </span>}
          <span className={colorClass}>{titleColored}</span>
        </h1>
        {subtitle && (
          <p className="text-gray-400 text-lg max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.15s', opacity: 0, animationFillMode: 'forwards' }}>
            {subtitle}
          </p>
        )}
      </div>
    </section>
  )
}
