import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-cream min-h-screen flex items-center justify-center px-4 watercolor-bg relative overflow-hidden">
      {/* Floating sparkles */}
      <div className="absolute top-[20%] left-[15%] w-2 h-2 bg-gold/20 rounded-full animate-twinkle" />
      <div className="absolute top-[40%] right-[20%] w-1.5 h-1.5 bg-pink-soft/30 rounded-full animate-twinkle" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-[30%] left-[25%] w-1 h-1 bg-gold/15 rounded-full animate-twinkle" style={{ animationDelay: '2s' }} />

      <div className="text-center max-w-md animate-fade-in-up">
        <img src="/brand-hero.jpg" alt="An.n.Ash" className="w-32 h-32 mx-auto mb-8 object-contain rounded-xl opacity-80 animate-float-slow" />
        <h1 className="text-7xl font-serif text-gold-gradient mb-4">404</h1>
        <h2 className="text-2xl font-serif text-foreground mb-4">Page Not Found</h2>
        <p className="text-foreground/60 mb-10 leading-relaxed">
          The page you&apos;re looking for seems to have vanished into the ether. Let&apos;s get you back to somewhere magical.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="inline-block bg-gradient-to-r from-gold to-gold-dark text-white px-8 py-3 rounded-full text-sm uppercase tracking-[0.15em] hover:shadow-[0_4px_20px_rgba(196,154,60,0.3)] transition-all duration-300">
            Go Home
          </Link>
          <Link href="/shop" className="inline-block border border-gold/50 text-gold px-8 py-3 rounded-full text-sm uppercase tracking-[0.15em] hover:bg-gold hover:text-white transition-all duration-300">
            Browse Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
