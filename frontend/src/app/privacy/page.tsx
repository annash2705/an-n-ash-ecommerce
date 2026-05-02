import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="bg-cream min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-foreground mb-4">Privacy Policy</h1>
          <p className="text-sm text-foreground opacity-60">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8">
          <section className="bg-white p-6 sm:p-8 rounded-xl border border-beige shadow-sm">
            <h2 className="font-serif text-xl text-foreground mb-3">1. Information We Collect</h2>
            <p className="text-foreground text-sm leading-relaxed">We may collect personal information that you provide to us when you register on the Site, express an interest in obtaining information about us or our products and services, when you participate in activities on the Site, or otherwise when you contact us.</p>
            <ul className="list-disc pl-5 mt-3 space-y-1 text-foreground text-sm">
              <li>Name and Contact Data (Email address, phone number, shipping/billing address)</li>
              <li>Credentials (Passwords and similar security information)</li>
              <li>Payment Data (Processed securely by our payment gateway, Razorpay)</li>
            </ul>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-xl border border-beige shadow-sm">
            <h2 className="font-serif text-xl text-foreground mb-3">2. How We Use Your Information</h2>
            <p className="text-foreground text-sm leading-relaxed">We use personal information collected via our Site for a variety of business purposes described below:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1 text-foreground text-sm">
              <li>To facilitate account creation and logon process.</li>
              <li>To fulfill and manage your orders, payments, returns, and exchanges.</li>
              <li>To send administrative information to you.</li>
              <li>To deliver targeted advertising to you.</li>
            </ul>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-xl border border-beige shadow-sm">
            <h2 className="font-serif text-xl text-foreground mb-3">3. Sharing Your Information</h2>
            <p className="text-foreground text-sm leading-relaxed">We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We share data with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf (e.g., payment processing, data analysis, email delivery, hosting services).</p>
          </section>

          <section className="bg-white p-6 sm:p-8 rounded-xl border border-beige shadow-sm">
            <h2 className="font-serif text-xl text-foreground mb-3">4. Security of Your Information</h2>
            <p className="text-foreground text-sm leading-relaxed">We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
