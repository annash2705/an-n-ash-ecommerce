import React from 'react';

export default function TermsAndConditions() {
  return (
    <div className="bg-cream min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-foreground mb-4">Terms and Conditions</h1>
          <p className="text-sm text-foreground opacity-60">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8">
          <section className="bg-white p-6 sm:p-8 rounded-xl border border-beige shadow-sm">
            <h2 className="font-serif text-xl text-foreground mb-3">1. Introduction</h2>
            <p className="text-foreground text-sm leading-relaxed">Welcome to An.n.Ash. By accessing our website and using our services, you agree to be bound by the following terms and conditions. If you do not agree with any part of these terms, please do not use our services.</p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-xl border border-beige shadow-sm">
            <h2 className="font-serif text-xl text-foreground mb-3">2. Products and Services</h2>
            <p className="text-foreground text-sm leading-relaxed">We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Site. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors.</p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-xl border border-beige shadow-sm">
            <h2 className="font-serif text-xl text-foreground mb-3">3. Pricing and Payments</h2>
            <p className="text-foreground text-sm leading-relaxed">All prices are subject to change without notice. We reserve the right to modify or discontinue any product or service without notice at any time. We shall not be liable to you or to any third party for any modification, price change, suspension, or discontinuance of the product or service.</p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-xl border border-beige shadow-sm">
            <h2 className="font-serif text-xl text-foreground mb-3">4. User Accounts</h2>
            <p className="text-foreground text-sm leading-relaxed">You may be required to register with the Site to access certain features. You agree to keep your password confidential and will be responsible for all use of your account and password.</p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-xl border border-beige shadow-sm">
            <h2 className="font-serif text-xl text-foreground mb-3">5. Intellectual Property</h2>
            <p className="text-foreground text-sm leading-relaxed">The Site and its original content, features, and functionality are owned by An.n.Ash and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.</p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-xl border border-beige shadow-sm">
            <h2 className="font-serif text-xl text-foreground mb-3">6. Governing Law</h2>
            <p className="text-foreground text-sm leading-relaxed">These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
