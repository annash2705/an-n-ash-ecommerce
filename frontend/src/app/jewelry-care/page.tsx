import React from 'react';

export default function JewelryCarePage() {
  return (
    <div className="bg-cream min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-foreground mb-4">Jewelry Care Guide</h1>
          <p className="text-foreground">Keep your An.n.Ash pieces looking magical for years to come</p>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-beige shadow-sm">
            <h2 className="font-serif text-xl text-foreground mb-4">General Care Tips</h2>
            <ul className="space-y-3 text-foreground text-sm leading-relaxed">
              <li className="flex items-start">
                <span className="text-gold mr-3 mt-0.5">✦</span>
                <span>Always put on your jewelry last — after applying makeup, perfume, and hairspray.</span>
              </li>
              <li className="flex items-start">
                <span className="text-gold mr-3 mt-0.5">✦</span>
                <span>Remove your jewelry before showering, swimming, exercising, or sleeping.</span>
              </li>
              <li className="flex items-start">
                <span className="text-gold mr-3 mt-0.5">✦</span>
                <span>Avoid direct contact with chemicals, cleaning products, and chlorinated water.</span>
              </li>
              <li className="flex items-start">
                <span className="text-gold mr-3 mt-0.5">✦</span>
                <span>Gently wipe your pieces with a soft, lint-free cloth after each wear to remove oils and residue.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-xl border border-beige shadow-sm">
            <h2 className="font-serif text-xl text-foreground mb-4">Storage</h2>
            <ul className="space-y-3 text-foreground text-sm leading-relaxed">
              <li className="flex items-start">
                <span className="text-gold mr-3 mt-0.5">✦</span>
                <span>Store each piece separately in the soft pouch or box provided to prevent scratching and tangling.</span>
              </li>
              <li className="flex items-start">
                <span className="text-gold mr-3 mt-0.5">✦</span>
                <span>Keep jewelry in a cool, dry place away from direct sunlight and humidity.</span>
              </li>
              <li className="flex items-start">
                <span className="text-gold mr-3 mt-0.5">✦</span>
                <span>Consider using anti-tarnish strips in your jewelry box for extra protection.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-xl border border-beige shadow-sm">
            <h2 className="font-serif text-xl text-foreground mb-4">Material-Specific Care</h2>
            <div className="space-y-4 text-foreground text-sm leading-relaxed">
              <div>
                <h3 className="font-semibold mb-1">Freshwater Pearls</h3>
                <p>Pearls are delicate and porous. Wipe gently with a damp cloth after wearing. Never soak in water or use ultrasonic cleaners.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Gold-Filled & Gold-Plated</h3>
                <p>Clean with a soft cloth. Avoid abrasive materials. Gold-fill lasts much longer than plating but should still be treated with care.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Semi-Precious Stones</h3>
                <p>Each stone has unique properties. Avoid extreme temperature changes and harsh chemicals. Clean with a soft, slightly damp cloth.</p>
              </div>
            </div>
          </div>

          <div className="text-center bg-pink-soft bg-opacity-50 p-8 rounded-xl">
            <p className="font-serif text-lg text-foreground mb-2">With love and care, your An.n.Ash pieces will remain timeless.</p>
            <p className="text-sm text-foreground opacity-60">Questions about caring for a specific piece? <a href="/contact" className="text-gold hover:underline">Reach out to us</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
