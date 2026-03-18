import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, X } from 'lucide-react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { api } from '../lib/api';

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

export default function Members() {
  const [provinces, setProvinces] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await api.get('/provinces');
        // Sort by name asc
        const sorted = data.sort((a: any, b: any) => a.name.localeCompare(b.name));
        setProvinces(sorted);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProvinces();
  }, []);

  if (loading) return null;

  return (
    <section id="members" className="py-24 bg-slate-50 border-t border-slate-100 relative overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-semibold text-blue-600 tracking-wide uppercase">Our Network</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Member Provinces
          </p>
          <p className="mt-4 max-w-2xl text-xl text-slate-500 mx-auto">
            CAPA brings together Anglican provinces across the African continent to collaborate on shared goals and challenges.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Map Section */}
          <div className="w-full lg:w-2/3 bg-white rounded-3xl shadow-sm border border-slate-200 p-4 relative">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 450,
                center: [20, 2] // Center on Africa
              }}
              style={{ width: "100%", height: "auto", maxHeight: "600px" }}
            >
              <ZoomableGroup center={[20, 2]} zoom={1} minZoom={1} maxZoom={5}>
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="#f1f5f9"
                        stroke="#cbd5e1"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: "none" },
                          hover: { fill: "#e2e8f0", outline: "none" },
                          pressed: { outline: "none" },
                        }}
                      />
                    ))
                  }
                </Geographies>
                
                {provinces.map((province) => (
                  <Marker 
                    key={province.id} 
                    coordinates={[province.longitude, province.latitude]}
                    onClick={() => setSelectedProvince(province)}
                    className="cursor-pointer group"
                  >
                    <circle 
                      r={6} 
                      fill={selectedProvince?.id === province.id ? "#2563eb" : "#ef4444"} 
                      stroke="#fff" 
                      strokeWidth={2} 
                      className="transition-colors duration-300 group-hover:fill-blue-600"
                    />
                    <text
                      textAnchor="middle"
                      y={-12}
                      style={{ fontFamily: "Inter, sans-serif", fill: "#475569", fontSize: "10px", fontWeight: 600 }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    >
                      {province.name}
                    </text>
                  </Marker>
                ))}
              </ZoomableGroup>
            </ComposableMap>
          </div>

          {/* List/Info Section */}
          <div className="w-full lg:w-1/3 space-y-4">
            <AnimatePresence mode="wait">
              {selectedProvince ? (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl p-6 border border-blue-100 shadow-lg relative"
                >
                  <button 
                    onClick={() => setSelectedProvince(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{selectedProvince.name}</h3>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    {selectedProvince.description}
                  </p>
                  <div className="text-sm text-slate-500 mb-6">
                    <strong>Countries Covered:</strong> {selectedProvince.countries}
                  </div>
                  <button className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                    View Province Details
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
                >
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                    Select a Province
                  </h3>
                  <p className="text-slate-500 text-sm mb-6">
                    Click on any marker on the map to view more information about our member provinces across Africa.
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {provinces.map((province) => (
                      <button
                        key={province.id}
                        onClick={() => setSelectedProvince(province)}
                        className="text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors border border-transparent hover:border-blue-100"
                      >
                        {province.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
