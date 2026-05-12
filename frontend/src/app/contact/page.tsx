import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactUs() {
  return (
    <div className="bg-cream min-h-screen py-16 watercolor-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center mb-14">
          <p className="text-gold tracking-[0.3em] text-xs uppercase mb-3">✦ Get in Touch ✦</p>
          <h1 className="text-4xl font-serif text-foreground mb-4">Contact Us</h1>
          <p className="text-foreground/60 max-w-2xl mx-auto leading-relaxed">Have questions about your order, our products, or anything else? We&apos;d love to hear from you.</p>
          <div className="gold-divider mt-6"><div className="gold-divider-gem" /></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-5">
            <div className="card-premium flex items-start p-6">
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mr-4 mt-0.5 flex-shrink-0">
                <Mail className="w-4 h-4 text-gold" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-foreground">Email Us</h3>
                <a href="mailto:anandashjewelry@gmail.com" className="text-gold hover:underline mt-1 block text-sm">anandashjewelry@gmail.com</a>
                <p className="text-xs text-foreground/50 mt-1">We aim to respond within 24 hours.</p>
              </div>
            </div>

            <div className="card-premium flex items-start p-6">
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mr-4 mt-0.5 flex-shrink-0">
                <Phone className="w-4 h-4 text-gold" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-foreground">Call Us</h3>
                <p className="text-foreground/80 mt-1 text-sm">+91 98765 43210</p>
                <p className="text-xs text-foreground/50 mt-1">Mon-Sat from 10am to 6pm IST.</p>
              </div>
            </div>

            <div className="card-premium flex items-start p-6">
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mr-4 mt-0.5 flex-shrink-0">
                <MapPin className="w-4 h-4 text-gold" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-foreground">Based In</h3>
                <p className="text-foreground/80 mt-1 text-sm">Mumbai, Maharashtra<br />India</p>
              </div>
            </div>
          </div>

          <div className="card-premium p-6 sm:p-8">
            <h2 className="text-xl font-serif text-foreground mb-5">Send us a message</h2>
            <form action="mailto:anandashjewelry@gmail.com" method="GET" encType="text/plain" className="space-y-4">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-foreground/80 mb-1.5">Name</label>
                <input type="text" id="contact-name" name="name" required className="input-elegant" placeholder="Your name" />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-foreground/80 mb-1.5">Email</label>
                <input type="email" id="contact-email" name="email" required className="input-elegant" placeholder="your@email.com" />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-foreground/80 mb-1.5">Message</label>
                <textarea id="contact-message" name="body" rows={4} required className="input-elegant resize-none" placeholder="How can we help you?" />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-gold to-gold-dark text-white font-medium py-3 px-4 rounded-full hover:shadow-[0_4px_20px_rgba(196,154,60,0.3)] transition-all duration-300 text-sm uppercase tracking-[0.15em]">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
