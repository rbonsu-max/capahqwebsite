import React, { useState, useEffect } from 'react';
import { Globe, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../lib/api';

export default function Footer() {
  const [logoError, setLogoError] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('/capa-logo.png');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.get('/settings/global');
        if (data && data.value) {
          const parsed = JSON.parse(data.value);
          if (parsed.logoUrl) {
            setLogoUrl(parsed.logoUrl);
            setLogoError(false);
          } else {
            setLogoUrl('/capa-logo.png');
            setLogoError(false);
          }
        }
      } catch (error) {
        console.error('Error fetching logo:', error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer id="support" className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              {!logoError ? (
                <img 
                  src={logoUrl} 
                  alt="CAPA Logo" 
                  className="h-16 w-auto object-contain brightness-0 invert"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <Globe className="h-8 w-8 text-blue-400 flex-shrink-0" />
              )}
              <div className="flex flex-col">
                <span className="font-bold text-xl leading-tight text-white">CAPA</span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider hidden sm:block">Council of Anglican Provinces of Africa</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 mb-6">
              An Instrument of Anglican Communion in Africa, dedicated to celebrating life and addressing challenges through holistic ministry.
            </p>
            <div className="flex space-x-3">
              <motion.a 
                whileHover={{ scale: 1.1, y: -2 }} 
                whileTap={{ scale: 0.9 }}
                href="https://facebook.com/capa" target="_blank" rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-colors shadow-sm"
              >
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.1, y: -2 }} 
                whileTap={{ scale: 0.9 }}
                href="https://twitter.com/capa" target="_blank" rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-400 hover:text-white transition-colors shadow-sm"
              >
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.1, y: -2 }} 
                whileTap={{ scale: 0.9 }}
                href="https://instagram.com/capa" target="_blank" rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-pink-600 hover:text-white transition-colors shadow-sm"
              >
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </motion.a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-6">Our Work</h3>
            <ul className="space-y-4">
              <li><Link to="/#work" className="text-sm hover:text-blue-400 transition-colors">Peace & Nation Building</Link></li>
              <li><Link to="/#work" className="text-sm hover:text-blue-400 transition-colors">Economic Empowerment</Link></li>
              <li><Link to="/#work" className="text-sm hover:text-blue-400 transition-colors">Church Life & Interfaith</Link></li>
              <li><Link to="/#work" className="text-sm hover:text-blue-400 transition-colors">Environmental Stewardship</Link></li>
              <li><Link to="/#work" className="text-sm hover:text-blue-400 transition-colors">Safe Migration</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li><Link to="/#about" className="text-sm hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><Link to="/#members" className="text-sm hover:text-blue-400 transition-colors">Member Provinces</Link></li>
              <li><Link to="/#news" className="text-sm hover:text-blue-400 transition-colors">News & Updates</Link></li>
              <li><Link to="/#resources" className="text-sm hover:text-blue-400 transition-colors">Resources</Link></li>
              <li><Link to="/external-partners" className="text-sm hover:text-blue-400 transition-colors">External Partners</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-6">Contact Us</h3>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-400 mr-3 shrink-0" />
                <span className="text-sm">Nairobi, Kenya</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-blue-400 mr-3 shrink-0" />
                <span className="text-sm">+254 (0) 20 272 2222</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-blue-400 mr-3 shrink-0" />
                <a href="mailto:info@capa-hq.org" className="text-sm hover:text-white transition-colors">info@capa-hq.org</a>
              </li>
            </ul>

            <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for your message. We will get back to you soon!'); }} className="space-y-3">
              <input 
                type="email" 
                placeholder="Your email address" 
                required 
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-sm text-white placeholder-slate-500 transition-colors" 
              />
              <textarea 
                placeholder="Your message" 
                required 
                rows={2} 
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-sm text-white placeholder-slate-500 resize-none transition-colors"
              ></textarea>
              <button 
                type="submit" 
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>Send Message</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Council of Anglican Provinces of Africa. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-slate-500">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
