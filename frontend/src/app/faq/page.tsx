import React from 'react';

export default function FAQPage() {
  const faqs = [
    {
      q: "How long does shipping take?",
      a: "Orders are typically processed within 1-3 business days. Once shipped, delivery takes 5-7 business days within India depending on your location."
    },
    {
      q: "Do you ship internationally?",
      a: "Currently, we only ship within India. We are working on adding international shipping options soon."
    },
    {
      q: "Can I cancel or modify my order?",
      a: "You can cancel your order before it has been shipped. Once an order is shipped, it cannot be cancelled. Visit your order details page to cancel."
    },
    {
      q: "Are your products handmade?",
      a: "Yes! Every piece at An.n.Ash is lovingly handcrafted. Each piece may have slight variations, making it truly one-of-a-kind."
    },
    {
      q: "What materials do you use?",
      a: "We use ethically sourced materials including freshwater pearls, semi-precious stones, gold-filled wire, sterling silver, and hypoallergenic metals."
    },
    {
      q: "How do I care for my jewelry?",
      a: "Avoid contact with water, perfume, and chemicals. Store in the pouch provided. Visit our Jewelry Care page for detailed instructions."
    },
    {
      q: "Can I request a custom design?",
      a: "Absolutely! Visit our Custom Orders page to submit your design request. We'll get back to you within 24-48 hours with a quote."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major credit/debit cards, UPI, net banking through Razorpay, as well as Cash on Delivery."
    },
    {
      q: "What is your return policy?",
      a: "We accept returns for eligible products within 7 days of delivery. The item must be unused and in its original packaging. Custom orders are non-returnable."
    },
  ];

  return (
    <div className="bg-cream min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-foreground mb-4">Frequently Asked Questions</h1>
          <p className="text-foreground">Everything you need to know about An.n.Ash</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <details key={idx} className="bg-white border border-beige rounded-xl shadow-sm group">
              <summary className="cursor-pointer p-6 text-foreground font-serif text-lg list-none flex justify-between items-center">
                {faq.q}
                <span className="text-gold text-xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="px-6 pb-6 text-foreground text-sm leading-relaxed border-t border-beige pt-4">
                {faq.a}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-12 text-center bg-white p-8 rounded-xl border border-beige shadow-sm">
          <h2 className="font-serif text-xl text-foreground mb-3">Still have questions?</h2>
          <p className="text-foreground text-sm mb-4">We're here to help!</p>
          <a href="/contact" className="inline-block bg-gold text-white px-6 py-2 text-sm uppercase tracking-widest hover:bg-gold-dark transition rounded-sm">
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
