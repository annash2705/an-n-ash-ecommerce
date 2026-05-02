import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactUs() {
  return (
    <div className="bg-cream min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-foreground mb-4">Contact Us</h1>
          <p className="text-foreground max-w-2xl mx-auto">
            Have questions about your order, our products, or anything else? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <div className="space-y-6">
              <div className="flex items-start bg-white p-5 rounded-xl border border-beige shadow-sm">
                <Mail className="w-6 h-6 text-gold mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-serif text-lg text-foreground">Email Us</h3>
                  <a href="mailto:anandashjewelry@gmail.com" className="text-gold hover:underline mt-1 block">
                    anandashjewelry@gmail.com
                  </a>
                  <p className="text-sm text-foreground opacity-60 mt-1">We aim to respond within 24 hours.</p>
                </div>
              </div>

              <div className="flex items-start bg-white p-5 rounded-xl border border-beige shadow-sm">
                <Phone className="w-6 h-6 text-gold mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-serif text-lg text-foreground">Call Us</h3>
                  <p className="text-foreground mt-1">+91 98765 43210</p>
                  <p className="text-sm text-foreground opacity-60 mt-1">Mon-Sat from 10am to 6pm IST.</p>
                </div>
              </div>

              <div className="flex items-start bg-white p-5 rounded-xl border border-beige shadow-sm">
                <MapPin className="w-6 h-6 text-gold mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-serif text-lg text-foreground">Based In</h3>
                  <p className="text-foreground mt-1">
                    Mumbai, Maharashtra<br />
                    India
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-xl border border-beige shadow-sm">
            <h2 className="text-xl font-serif text-foreground mb-4">Send us a message</h2>
            <form
              action={`mailto:anandashjewelry@gmail.com`}
              method="GET"
              encType="text/plain"
              className="space-y-4"
            >
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-foreground mb-1">Name</label>
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  required
                  className="w-full border border-beige rounded-sm px-3 py-2 focus:outline-none focus:border-gold"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  required
                  className="w-full border border-beige rounded-sm px-3 py-2 focus:outline-none focus:border-gold"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-foreground mb-1">Message</label>
                <textarea
                  id="contact-message"
                  name="body"
                  rows={4}
                  required
                  className="w-full border border-beige rounded-sm px-3 py-2 focus:outline-none focus:border-gold"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-gold text-white font-medium py-2 px-4 rounded-sm hover:bg-gold-dark transition text-sm uppercase tracking-widest"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
