import React, { useState, useEffect } from 'react';
import { ExternalLink, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ExternalPartners() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const data = await api.get('/partners');
        // Sort by name asc
        const sorted = data.sort((a: any, b: any) => a.name.localeCompare(b.name));
        
        const uniquePartners: any[] = [];
        const seenNames = new Set();
        
        sorted.forEach((partner: any) => {
          if (!seenNames.has(partner.name)) {
            seenNames.add(partner.name);
            uniquePartners.push(partner);
          }
        });
        
        setPartners(uniquePartners);
      } catch (error) {
        console.error("Error fetching partners:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">External Partners</h1>
            <p className="text-lg text-slate-600 max-w-3xl">
              CAPA works closely with various international and regional organizations to foster collaboration, peace, and development across the continent and the globe.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((partner) => (
                <a 
                  key={partner.id}
                  href={partner.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full relative"
                >
                  <div className="absolute top-6 right-6 text-slate-300 group-hover:text-blue-500 transition-colors duration-300">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                  
                  <div className="flex flex-col items-start mb-4">
                    {partner.logoUrl ? (
                      <div className="h-16 w-auto mb-4 group-hover:scale-110 transition-transform duration-500 origin-left">
                        <img src={partner.logoUrl} alt={partner.name} className="h-full w-auto object-contain mix-blend-multiply" />
                      </div>
                    ) : (
                      <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 font-bold text-xl">
                        {partner.name.charAt(0)}
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors pr-8">{partner.name}</h3>
                  </div>
                  
                  {partner.description ? (
                    <p className="text-slate-600 flex-grow mb-6">{partner.description}</p>
                  ) : (
                    <div className="flex-grow mb-6"></div>
                  )}
                  
                  <div className="mt-auto pt-4 border-t border-slate-100 text-sm font-semibold text-blue-600 group-hover:text-blue-800 flex items-center transition-colors">
                    Visit Website <ExternalLink className="w-4 h-4 ml-1.5" />
                  </div>
                </a>
              ))}
              {partners.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">
                  No external partners found.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
