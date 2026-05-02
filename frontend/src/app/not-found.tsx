import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-cream min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-serif text-gold mb-4">404</h1>
        <h2 className="text-2xl font-serif text-foreground mb-4">Page Not Found</h2>
        <p className="text-foreground mb-8">
          The page you're looking for seems to have vanished into the ether. Let's get you back to somewhere magical.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-block bg-gold text-white px-6 py-3 rounded-md text-sm uppercase tracking-widest hover:bg-gold-dark transition"
          >
            Go Home
          </Link>
          <Link
            href="/shop"
            className="inline-block border border-gold text-gold px-6 py-3 rounded-md text-sm uppercase tracking-widest hover:bg-gold hover:text-white transition"
          >
            Browse Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
