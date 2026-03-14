import React from 'react';

export default function RefundPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl pt-24">
      <h1 className="text-3xl font-bold mb-6">Cancellation & Refund Policy</h1>
      <p className="mb-4 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
      
      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold mb-3 text-black">1. Order Cancellations</h2>
          <p>You may cancel your order at any time prior to the order being processed and shipped or marked as ready for pickup. Once an order has been shipped or marked as ready for pickup, it can no longer be cancelled. Customized or personalized orders cannot be cancelled once production has begun.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-black">2. Returns and Refunds</h2>
          <p>We accept returns for eligible products within 7 days of delivery. To be eligible for a return, the item must be unused, in the same condition that you received it, and in its original packaging.</p>
          <p className="mt-2">Certain goods are exempt from being returned, such as perishable items, custom-made items, and intimate/sanitary goods.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-black">3. Refund Process</h2>
          <p>Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund. If you are approved, your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment, within a certain amount of days.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3 text-black">4. Damaged or Defective Items</h2>
          <p>If you receive a defective or damaged item, please contact us immediately upon receipt with details and photos of the product and the defect. We will evaluate the issue and make it right by offering a replacement or a full refund.</p>
        </section>
      </div>
    </div>
  );
}
