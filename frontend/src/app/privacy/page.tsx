import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl pt-24">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
      
      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold mb-3 text-black">1. Information We Collect</h2>
          <p>We may collect personal information that you provide to us when you register on the Site, express an interest in obtaining information about us or our products and services, when you participate in activities on the Site, or otherwise when you contact us.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Name and Contact Data (Email address, phone number, shipping/billing address)</li>
            <li>Credentials (Passwords and similar security information)</li>
            <li>Payment Data (Processed securely by our payment gateway, Razorpay)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-black">2. How We Use Your Information</h2>
          <p>We use personal information collected via our Site for a variety of business purposes described below:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>To facilitate account creation and logon process.</li>
            <li>To fulfill and manage your orders, payments, returns, and exchanges.</li>
            <li>To send administrative information to you.</li>
            <li>To deliver targeted advertising to you.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-black">3. Sharing Your Information</h2>
          <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We share data with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf (e.g., payment processing, data analysis, email delivery, hosting services).</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-black">4. Security of Your Information</h2>
          <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.</p>
        </section>
      </div>
    </div>
  );
}
