import React from 'react';

export default function RefundPolicy() {
  return (
    <div className="bg-cream min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-foreground mb-4">Cancellation & Refund Policy</h1>
          <p className="text-sm text-foreground opacity-60">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8">
          <section className="bg-white p-6 sm:p-8 rounded-xl border border-beige shadow-sm">
            <h2 className="font-serif text-xl text-foreground mb-3">1. Order Cancellations</h2>
            <p className="text-foreground text-sm leading-relaxed">You may cancel your order at any time prior to the order being processed and shipped or marked as ready for pickup. Once an order has been shipped or marked as ready for pickup, it can no longer be cancelled. Customized or personalized orders cannot be cancelled once production has begun.</p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-xl border border-beige shadow-sm">
            <h2 className="font-serif text-xl text-foreground mb-3">2. Returns and Refunds</h2>
            <p className="text-foreground text-sm leading-relaxed">We accept returns for eligible products within 7 days of delivery. To be eligible for a return, the item must be unused, in the same condition that you received it, and in its original packaging.</p>
            <p className="text-foreground text-sm leading-relaxed mt-2">Certain goods are exempt from being returned, such as perishable items, custom-made items, and intimate/sanitary goods.</p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-xl border border-beige shadow-sm">
            <h2 className="font-serif text-xl text-foreground mb-3">3. Refund Process</h2>
            <p className="text-foreground text-sm leading-relaxed">Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund. If you are approved, your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment, within a certain amount of days.</p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-xl border border-beige shadow-sm">
            <h2 className="font-serif text-xl text-foreground mb-3">4. Damaged or Defective Items</h2>
            <p className="text-foreground text-sm leading-relaxed">If you receive a defective or damaged item, please contact us immediately upon receipt with details and photos of the product and the defect. We will evaluate the issue and make it right by offering a replacement or a full refund.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
