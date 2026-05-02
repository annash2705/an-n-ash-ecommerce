import Link from "next/link";
import { Button } from "@/components/ui/Button";

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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center bg-beige overflow-hidden">
        {/* Abstract shapes or bg image can go here. Using a soft gradient for now */}
        <div className="absolute inset-0 bg-gradient-to-br from-cream to-pink-soft opacity-60"></div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <span className="text-gold tracking-widest text-sm uppercase mb-4 block">Handcrafted with magic</span>
          <h1 className="text-5xl md:text-7xl font-serif text-foreground mb-6 leading-tight">
            Whimsical Jewelry for the Ethereal Soul
          </h1>
          <p className="text-lg md:text-xl text-foreground mb-10 font-light">
            Discover our collection of unique, handmade pieces designed to bring out your inner goddess.
          </p>
          <Link href="/shop">
            <Button size="lg" className="px-10 py-4 text-sm tracking-widest uppercase">
              Explore Collection
            </Button>
          </Link>
        </div>
      </section>

      {/* Brand Introduction */}
      <section className="py-24 bg-cream text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif mb-6 text-gold-dark">The Art of An.n.Ash</h2>
          <p className="text-lg leading-relaxed text-foreground mb-8">
            Every piece at An.n.Ash is born from a love for poetry, nature, and the subtle magic of the everyday.
            We source ethical materials and lovingly handcraft each accessory, ensuring that your jewelry is as unique as you are.
            From delicate pearl chokers to bold, statement arm cuffs, find the piece that speaks to your spirit.
          </p>
          <div className="w-24 h-[1px] bg-gold mx-auto"></div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-pink-soft bg-opacity-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif mb-4 text-foreground">Featured Creations</h2>
            <Link href="/shop" className="text-gold hover:text-gold-dark transition uppercase tracking-wider text-sm">
              View All Jewelry &rarr;
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {featuredProducts.map((product: any) => (
                <Link href={`/product/${product._id}`} key={product._id} className="group cursor-pointer">
                  <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-t-full rounded-b-xl shadow-sm bg-white">
                    <img
                      src={product.images && product.images.length > 0 ? product.images[0].url : "https://via.placeholder.com/800x1200?text=No+Image"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gold tracking-wider uppercase mb-1">{product.category}</p>
                    <h3 className="font-serif text-lg text-foreground group-hover:text-gold transition mb-2">{product.name}</h3>
                    <p className="text-foreground">₹{product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center text-foreground py-10 opacity-70">
              <p>Check back soon for our latest magical creations.</p>
            </div>
          )}
        </div>
      </section>

      {/* Categories — now includes Hair Accessories */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif text-center mb-16 text-foreground">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {["Necklaces", "Earrings", "Arm Cuffs", "Hair Accessories", "Rings"].map((category) => (
              <Link href={`/shop?category=${category}`} key={category} className="group text-center">
                <div className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full bg-beige border border-gold border-opacity-30 flex items-center justify-center mb-6 group-hover:bg-pink-soft transition duration-500">
                  <h3 className="font-serif text-lg text-foreground text-opacity-80 group-hover:text-gold-dark transition text-center px-2">{category}</h3>
                </div>
                <span className="uppercase tracking-widest text-sm text-foreground group-hover:text-gold transition">Explore</span>
              </Link>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
}
