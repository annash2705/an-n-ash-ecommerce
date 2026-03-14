import React from 'react';

export default function TermsAndConditions() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl pt-24">
      <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
      <p className="mb-4 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
      
      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold mb-3 text-black">1. Introduction</h2>
          <p>Welcome to An N Ash. By accessing our website and using our services, you agree to be bound by the following terms and conditions. If you do not agree with any part of these terms, please do not use our services.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-black">2. Products and Services</h2>
          <p>We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Site. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-black">3. Pricing and Payments</h2>
          <p>All prices are subject to change without notice. We reserve the right to modify or discontinue any product or service without notice at any time. We shall not be liable to you or to any third party for any modification, price change, suspension, or discontinuance of the product or service.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-black">4. User Accounts</h2>
          <p>You may be required to register with the Site to access certain features. You agree to keep your password confidential and will be responsible for all use of your account and password.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-black">5. Intellectual Property</h2>
          <p>The Site and its original content, features, and functionality are owned by An N Ash and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-3 text-black">6. Governing Law</h2>
          <p>These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>
        </section>
      </div>
    </div>
  );
}
