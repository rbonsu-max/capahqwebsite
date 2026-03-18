import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, Globe, ExternalLink } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('/capa-logo.png');

  const location = useLocation();
  const navigate = useNavigate();

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

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { 
      name: 'Leadership', 
      href: '#',
      dropdown: [
        { name: 'Primates', url: '/leadership/primates', isInternal: true },
        { name: 'Standing Committee Members', url: '/leadership/standing-committee', isInternal: true },
        { name: 'Trustees', url: '/leadership/trustees', isInternal: true }
      ]
    },
    { name: 'Our Work', href: '/#work' },
    { name: 'Members', href: '/#members' },
    { 
      name: 'Resources', 
      href: '/#resources',
      dropdown: [
        { name: 'External Partners', url: '/external-partners', isInternal: true }
      ]
    },
    { name: 'Communications', href: '/#news' },
    { name: 'Gallery', href: '/gallery' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === '#') {
      e.preventDefault();
      return;
    }
    if (href.startsWith('/#')) {
      e.preventDefault();
      if (location.pathname === '/') {
        const id = href.substring(2);
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate(href);
      }
      setIsOpen(false);
    } else if (href === '/') {
      e.preventDefault();
      if (location.pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate('/');
      }
      setIsOpen(false);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <nav className="fixed w-full bg-white/95 backdrop-blur-sm z-50 shadow-sm border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              {!logoError ? (
                <img 
                  src={logoUrl} 
                  alt="CAPA Logo" 
                  className="h-16 w-auto object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <Globe className="h-8 w-8 text-blue-700 flex-shrink-0" />
              )}
              <div className="flex flex-col">
                <span className="font-bold text-xl leading-tight text-slate-900">CAPA</span>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider hidden sm:block">Council of Anglican Provinces of Africa</span>
              </div>
            </Link>
          </div>
          
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <div 
                key={link.name} 
                className="relative"
                onMouseEnter={() => setActiveDropdown(link.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <a
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors flex items-center gap-1 py-2 whitespace-nowrap"
                >
                  {link.name}
                  {link.dropdown && <ChevronDown className={`h-4 w-4 transition-transform ${activeDropdown === link.name ? 'rotate-180' : ''}`} />}
                </a>
                
                {/* Desktop Dropdown */}
                <AnimatePresence>
                  {link.dropdown && activeDropdown === link.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 overflow-hidden"
                    >
                      {link.dropdown.map((item, idx) => (
                        item.isInternal ? (
                          <Link
                            key={idx}
                            to={item.url}
                            className="flex items-center justify-between px-4 py-2.5 text-sm text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                          >
                            <span className="truncate pr-2">{item.name}</span>
                          </Link>
                        ) : (
                          <a
                            key={idx}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between px-4 py-2.5 text-sm text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                          >
                            <span className="truncate pr-2">{item.name}</span>
                            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 opacity-50" />
                          </a>
                        )
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            <a
              href="/#donate"
              onClick={(e) => handleNavClick(e, '/#donate')}
              className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-full text-white bg-blue-700 hover:bg-blue-800 transition-colors shadow-sm whitespace-nowrap"
            >
              Donate
            </a>
          </div>

          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-slate-900 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-slate-100 overflow-hidden shadow-xl absolute w-full"
          >
            <div className="px-4 pt-2 pb-6 space-y-2 max-h-[calc(100dvh-5rem)] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
              {navLinks.map((link) => (
                <div key={link.name} className="border-b border-slate-50 last:border-0 pb-2 last:pb-0">
                  {link.dropdown ? (
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === link.name ? null : link.name)}
                      className="flex items-center justify-between w-full px-3 py-3 rounded-xl text-base font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 transition-colors"
                    >
                      {link.name}
                      <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${activeDropdown === link.name ? 'rotate-180 text-blue-700' : 'text-slate-400'}`} />
                    </button>
                  ) : (
                    <a
                      href={link.href}
                      className="block px-3 py-3 rounded-xl text-base font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 transition-colors"
                      onClick={(e) => handleNavClick(e, link.href)}
                    >
                      {link.name}
                    </a>
                  )}
                  
                  {/* Mobile Dropdown */}
                  <AnimatePresence>
                    {link.dropdown && activeDropdown === link.name && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden bg-slate-50/80 rounded-xl mx-2"
                      >
                        <div className="py-2">
                          {link.dropdown.map((item, idx) => (
                            item.isInternal ? (
                              <Link
                                key={idx}
                                to={item.url}
                                className="flex items-center justify-between pl-4 pr-4 py-3 text-sm font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-100/50 transition-colors rounded-lg mx-2"
                                onClick={() => setIsOpen(false)}
                              >
                                <span className="truncate pr-2">{item.name}</span>
                              </Link>
                            ) : (
                              <a
                                key={idx}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between pl-4 pr-4 py-3 text-sm font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-100/50 transition-colors rounded-lg mx-2"
                                onClick={() => setIsOpen(false)}
                              >
                                <span className="truncate pr-2">{item.name}</span>
                                <ExternalLink className="h-4 w-4 flex-shrink-0 opacity-40" />
                              </a>
                            )
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              <div className="pt-4 px-2">
                <a
                  href="/#donate"
                  className="flex items-center justify-center w-full px-5 py-3.5 border border-transparent text-base font-bold rounded-xl text-white bg-blue-700 hover:bg-blue-800 shadow-md shadow-blue-200 transition-all active:scale-[0.98]"
                  onClick={(e) => handleNavClick(e, '/#donate')}
                >
                  Donate to CAPA
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
