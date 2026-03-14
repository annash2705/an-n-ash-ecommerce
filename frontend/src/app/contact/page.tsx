import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactUs() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl pt-24">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <p className="text-gray-700 mb-8">
            Have questions about your order, our products, or anything else? We'd love to hear from you. Please reach out to us using any of the methods below.
          </p>

          <div className="space-y-6">
            <div className="flex items-start">
              <Mail className="w-6 h-6 text-indigo-600 mr-4 mt-1" />
              <div>
                <h3 className="font-medium text-lg">Email Us</h3>
                <p className="text-gray-600 mt-1">support@annash.com</p>
                <p className="text-sm text-gray-500 mt-1">We aim to respond within 24 hours.</p>
              </div>
            </div>

            <div className="flex items-start">
              <Phone className="w-6 h-6 text-indigo-600 mr-4 mt-1" />
              <div>
                <h3 className="font-medium text-lg">Call Us</h3>
                <p className="text-gray-600 mt-1">+91 123 456 7890</p>
                <p className="text-sm text-gray-500 mt-1">Mon-Fri from 9am to 6pm IST.</p>
              </div>
            </div>

            <div className="flex items-start">
              <MapPin className="w-6 h-6 text-indigo-600 mr-4 mt-1" />
              <div>
                <h3 className="font-medium text-lg">Visit Us</h3>
                <p className="text-gray-600 mt-1">
                  123 Business Avenue, Suite 400<br />
                  Mumbai, Maharashtra<br />
                  India - 400001
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Send us a message</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 pb-1">Name</label>
              <input type="text" id="name" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 pb-1">Email</label>
              <input type="email" id="email" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="your@email.com" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 pb-1">Message</label>
              <textarea id="message" rows={4} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="How can we help you?"></textarea>
            </div>
            <button type="button" className="w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 transition">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
