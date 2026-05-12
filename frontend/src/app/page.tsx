import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getOptimizedImageUrl } from "@/lib/cloudinary";

export default async function Home() {
  // Fetch latest products directly from our backend API
  let featuredProducts = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      const allProducts = data.products || data;

      // Group products by category and find the lowest price in each
      const cheapestByCategory: Record<string, any> = {};

      (Array.isArray(allProducts) ? allProducts : []).forEach((product: any) => {
        const cat = product.category;
        if (!cat) return;

        if (!cheapestByCategory[cat] || product.price < cheapestByCategory[cat].price) {
          cheapestByCategory[cat] = product;
        }
      });

      // Convert map back to an array for rendering
      featuredProducts = Object.values(cheapestByCategory);
    }
  } catch (error) {
    console.error("Failed to fetch products for homepage");
  }

  const categoryIcons: Record<string, string> = {
    "Necklaces": "✦",
    "Earrings": "❋",
    "Arm Cuffs": "◇",
    "Hair Accessories": "✿",
    "Rings": "○",
  };

  return (
    <div className="flex flex-col">
      {/* ═══════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════ */}
      <section className="relative hero-gradient overflow-hidden">
        {/* Floating sparkle decorations */}
        <div className="absolute top-[10%] left-[8%] w-2 h-2 bg-gold/30 rounded-full animate-twinkle" style={{ animationDelay: '0s' }} />
        <div className="absolute top-[20%] right-[12%] w-1.5 h-1.5 bg-gold/40 rounded-full animate-twinkle" style={{ animationDelay: '0.7s' }} />
        <div className="absolute bottom-[35%] left-[18%] w-1 h-1 bg-gold/20 rounded-full animate-twinkle" style={{ animationDelay: '1.4s' }} />
        <div className="absolute top-[55%] right-[22%] w-2 h-2 bg-pink-soft/40 rounded-full animate-twinkle" style={{ animationDelay: '2.1s' }} />
        <div className="absolute bottom-[25%] right-[8%] w-1.5 h-1.5 bg-gold/25 rounded-full animate-twinkle" style={{ animationDelay: '0.3s' }} />
        <div className="absolute top-[35%] left-[4%] w-1 h-1 bg-gold/30 rounded-full animate-twinkle" style={{ animationDelay: '1.8s' }} />
        <div className="absolute top-[8%] left-[45%] w-1.5 h-1.5 bg-gold/20 rounded-full animate-twinkle" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-[15%] left-[35%] w-1 h-1 bg-pink-soft/30 rounded-full animate-twinkle" style={{ animationDelay: '2.5s' }} />
        <div className="absolute top-[70%] left-[10%] w-2 h-2 bg-gold-light/20 rounded-full animate-twinkle" style={{ animationDelay: '1.1s' }} />
        <div className="absolute top-[15%] right-[30%] w-1 h-1 bg-gold/35 rounded-full animate-twinkle" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-[40%] right-[5%] w-1.5 h-1.5 bg-pink-blush/40 rounded-full animate-twinkle" style={{ animationDelay: '1.6s' }} />
        <div className="absolute top-[50%] left-[30%] w-1 h-1 bg-gold/15 rounded-full animate-twinkle" style={{ animationDelay: '2.8s' }} />

        {/* Drifting luminous orbs */}
        <div className="absolute w-44 h-44 rounded-full opacity-[0.07] blur-3xl animate-[drift1_12s_ease-in-out_infinite]"
          style={{ background: 'radial-gradient(circle, #C49A3C, transparent)', top: '30%', left: '25%' }}
        />
        <div className="absolute w-56 h-56 rounded-full opacity-[0.05] blur-3xl animate-[drift2_15s_ease-in-out_infinite]"
          style={{ background: 'radial-gradient(circle, #F2C6C8, transparent)', top: '20%', right: '20%' }}
        />
        <div className="absolute w-36 h-36 rounded-full opacity-[0.06] blur-3xl animate-[drift3_10s_ease-in-out_infinite]"
          style={{ background: 'radial-gradient(circle, #8B9E6B, transparent)', bottom: '35%', left: '35%' }}
        />
        <div className="absolute w-48 h-48 rounded-full opacity-[0.04] blur-3xl animate-[drift1_18s_ease-in-out_infinite_reverse]"
          style={{ background: 'radial-gradient(circle, #E8D5A3, transparent)', bottom: '25%', right: '30%' }}
        />
        <div className="absolute w-32 h-32 rounded-full opacity-[0.08] blur-2xl animate-[drift2_9s_ease-in-out_infinite]"
          style={{ background: 'radial-gradient(circle, #FADDE1, transparent)', top: '45%', left: '15%' }}
        />
        <div className="absolute w-40 h-40 rounded-full opacity-[0.05] blur-3xl animate-[drift3_14s_ease-in-out_infinite_reverse]"
          style={{ background: 'radial-gradient(circle, #C49A3C, transparent)', top: '15%', left: '50%' }}
        />

        {/* Flex column: image on top, text below — no overlap */}
        <div className="relative z-10 flex flex-col items-center pt-10 pb-16">

          {/* Brand image with blink + wing flap */}
          <div className="relative animate-float-slow select-none w-[380px] sm:w-[480px] md:w-[580px] lg:w-[650px] -mb-16">
            <img
              src="/brand-hero.jpg"
              alt="An.n.Ash — Wired Jewellery by San"
              className="w-full relative z-[1]"
              style={{
                maskImage: 'radial-gradient(ellipse 75% 70% at 50% 50%, black 30%, transparent 75%)',
                WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 50% 50%, black 30%, transparent 75%)',
                filter: 'drop-shadow(0 0 60px rgba(196,154,60,0.12)) drop-shadow(0 0 120px rgba(242,198,200,0.08))',
                opacity: 0.9,
              }}
            />
            <img
              src="/brand-hero-wings.png"
              alt="" aria-hidden="true"
              className="absolute inset-0 w-full z-[2] animate-wing-flap"
              style={{
                maskImage: 'radial-gradient(ellipse 75% 70% at 50% 50%, black 30%, transparent 75%)',
                WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 50% 50%, black 30%, transparent 75%)',
                filter: 'drop-shadow(0 0 60px rgba(196,154,60,0.12)) drop-shadow(0 0 120px rgba(242,198,200,0.08))',
              }}
            />
            <img
              src="/brand-hero-closed.png"
              alt="" aria-hidden="true"
              className="absolute inset-0 w-full z-[3] animate-real-blink"
              style={{
                maskImage: 'radial-gradient(ellipse 75% 70% at 50% 50%, black 30%, transparent 75%)',
                WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 50% 50%, black 30%, transparent 75%)',
                filter: 'drop-shadow(0 0 60px rgba(196,154,60,0.12)) drop-shadow(0 0 120px rgba(242,198,200,0.08))',
              }}
            />
          </div>

          {/* Text content — naturally below the image */}
          <div className="text-center px-4 max-w-3xl mx-auto">

            {/* Decorative sparkle line */}
            <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in-up">
              <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-gold/40" />
              <span className="text-gold/60 text-xs tracking-[0.4em] uppercase font-medium">Wired Jewellery by San</span>
              <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-gold/40" />
            </div>

            {/* Creative tagline */}
            <h2 className="font-serif text-2xl md:text-3xl text-foreground/80 mb-8 animate-fade-in-up-delay leading-snug">
              Ethereal, handcrafted jewelry —<br className="hidden sm:block" />
              <span className="text-foreground/60 text-lg md:text-xl font-light italic block mt-3">each piece born from a love for</span>
            </h2>

            {/* Animated keyword pills */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12 animate-fade-in-up-delay">
              <span className="inline-flex items-center gap-2 bg-gold/[0.06] border border-gold/20 text-gold px-5 py-2 rounded-full text-sm font-medium tracking-wider backdrop-blur-sm hover:bg-gold/10 hover:border-gold/40 transition-all duration-500 cursor-default">
                <span className="text-base">✦</span> Poetry
              </span>
              <span className="inline-flex items-center gap-2 bg-sage/[0.06] border border-sage/20 text-sage px-5 py-2 rounded-full text-sm font-medium tracking-wider backdrop-blur-sm hover:bg-sage/10 hover:border-sage/40 transition-all duration-500 cursor-default">
                <span className="text-base">❁</span> Nature
              </span>
              <span className="inline-flex items-center gap-2 bg-pink-soft/[0.08] border border-pink-soft/30 text-pink-soft px-5 py-2 rounded-full text-sm font-medium tracking-wider backdrop-blur-sm hover:bg-pink-soft/15 hover:border-pink-soft/50 transition-all duration-500 cursor-default">
                <span className="text-base">✧</span> Magic
              </span>
            </div>

            {/* CTA with shimmer sweep */}
            <div className="animate-fade-in-up-delay-2">
              <Link href="/shop">
                <button className="group relative overflow-hidden bg-gradient-to-r from-gold to-gold-dark text-white px-14 py-4 rounded-full text-sm uppercase tracking-[0.2em] font-medium hover:shadow-[0_4px_30px_rgba(196,154,60,0.35)] transition-all duration-500">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="relative">Explore Collection</span>
                </button>
              </Link>
            </div>

            {/* Scroll indicator */}
            <div className="mt-14 animate-float">
              <div className="flex flex-col items-center gap-2">
                <span className="text-gold/40 text-[10px] tracking-[0.3em] uppercase">Scroll</span>
                <div className="w-[1px] h-10 bg-gradient-to-b from-gold/40 to-transparent" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          BRAND INTRODUCTION
          ═══════════════════════════════════════ */}
      <section className="py-28 watercolor-bg text-center px-4">
        <div className="max-w-3xl mx-auto">
          <div className="gold-divider mb-8">
            <div className="gold-divider-gem" />
          </div>

          <h2 className="text-3xl md:text-4xl font-serif mb-8 text-gold-gradient">The Art of An.n.Ash</h2>

          <p className="text-lg leading-[1.9] text-foreground/80 mb-8">
            Every piece at An.n.Ash is born from a love for poetry, nature, and the subtle magic of the everyday.
            We source ethical materials and lovingly handcraft each accessory, ensuring that your jewelry is as unique as you are.
            From delicate pearl chokers to bold, statement arm cuffs — find the piece that speaks to your spirit.
          </p>

          <div className="gold-divider">
            <div className="gold-divider-gem" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURED PRODUCTS
          ═══════════════════════════════════════ */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gold tracking-[0.3em] text-xs uppercase mb-3">✦ Curated for you ✦</p>
            <h2 className="text-3xl md:text-4xl font-serif mb-5 text-foreground">Featured Creations</h2>
            <Link href="/shop" className="inline-flex items-center gap-2 text-gold hover:text-gold-dark transition-colors duration-300 uppercase tracking-[0.2em] text-xs font-medium group">
              View All Jewelry
              <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product: any, i: number) => (
                <Link
                  href={`/product/${product._id}`}
                  key={product._id}
                  className="group cursor-pointer"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="card-premium card-shimmer overflow-hidden">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={product.images && product.images.length > 0 ? getOptimizedImageUrl(product.images[0].url) : "https://via.placeholder.com/800x1200?text=No+Image"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      {/* Category tag */}
                      <div className="absolute top-3 left-3 bg-cream/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-semibold text-gold uppercase tracking-[0.1em] border border-gold-light/30">
                        {product.category}
                      </div>
                    </div>
                    <div className="text-center p-5">
                      <h3 className="font-serif text-lg text-foreground group-hover:text-gold transition-colors duration-300 mb-2">{product.name}</h3>
                      <p className="text-gold font-semibold">₹{product.price}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-foreground/60 text-lg font-light italic">Check back soon for our latest magical creations.</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SHOP BY CATEGORY
          ═══════════════════════════════════════ */}
      <section className="py-28 watercolor-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gold tracking-[0.3em] text-xs uppercase mb-3">✦ Browse ✦</p>
            <h2 className="text-3xl md:text-4xl font-serif text-foreground">Shop by Category</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
            {["Necklaces", "Earrings", "Arm Cuffs", "Hair Accessories", "Rings"].map((category, i) => (
              <Link
                href={`/shop?category=${category}`}
                key={category}
                className="group text-center"
              >
                <div className="w-28 h-28 md:w-36 md:h-36 mx-auto rounded-full bg-ivory border border-gold-light/40 flex items-center justify-center mb-5 group-hover:bg-pink-blush/50 group-hover:border-gold/60 group-hover:shadow-[0_0_30px_rgba(196,154,60,0.1)] transition-all duration-500 relative overflow-hidden">
                  {/* Shimmer on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <div className="text-center relative z-10">
                    <span className="text-2xl md:text-3xl block mb-1 text-gold/60 group-hover:text-gold transition-colors duration-300">
                      {categoryIcons[category] || "✦"}
                    </span>
                    <h3 className="font-serif text-sm md:text-base text-foreground/80 group-hover:text-gold-dark transition-colors duration-300 px-2 leading-tight">
                      {category}
                    </h3>
                  </div>
                </div>
                <span className="uppercase tracking-[0.2em] text-xs text-foreground/50 group-hover:text-gold transition-colors duration-300 font-medium">
                  Explore
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CUSTOM ORDERS CTA
          ═══════════════════════════════════════ */}
      <section className="py-24 bg-cream relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-10 right-10 w-3 h-3 bg-gold/10 rounded-full animate-twinkle" />
        <div className="absolute bottom-16 left-16 w-2 h-2 bg-pink-soft/30 rounded-full animate-twinkle" style={{ animationDelay: '1s' }} />

        <div className="max-w-3xl mx-auto text-center px-4">
          <p className="text-gold tracking-[0.3em] text-xs uppercase mb-3">✦ Something Special ✦</p>
          <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-6">Dream It, We&apos;ll Create It</h2>
          <p className="text-foreground/70 text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
            Have a vision for a one-of-a-kind piece? Our custom order service lets you collaborate directly
            with our artisan to bring your ethereal jewelry dreams to life.
          </p>
          <Link href="/custom-orders">
            <Button size="lg" variant="outline" className="px-10">
              Request Custom Piece
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
