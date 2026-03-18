import React from 'react';
import { motion } from 'motion/react';
import { Target, Eye, Heart, Users } from 'lucide-react';

export default function About() {
  const values = [
    {
      title: 'Our Mission',
      description: 'To celebrate life and address challenges through the Anglican Church in Africa.',
      icon: Target,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
    },
    {
      title: 'Our Vision',
      description: "Provide holistic ministry to fulfill God's promise of abundant life.",
      icon: Eye,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Core Values',
      description: 'CAPA is guided by core values in achieving its mission and vision, drawing all people into fellowship.',
      icon: Heart,
      color: 'text-rose-600',
      bg: 'bg-rose-100',
    },
  ];

  const stats = [
    { value: '13+', label: 'Provinces' },
    { value: '25+', label: 'Countries' },
    { value: '40M+', label: 'Members' },
    { value: '4', label: 'Commissions' },
  ];

  return (
    <section id="about" className="py-24 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-semibold text-blue-600 tracking-wide uppercase">Who We Are</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Building Capacity Across Africa
          </p>
          <p className="mt-4 max-w-2xl text-xl text-slate-500 mx-auto">
            CAPA plays a catalytic role and has established four commissions composed of members drawn from all Provinces in Africa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {values.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex items-center justify-center p-3 rounded-xl ${item.bg} mb-5`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-blue-900 rounded-3xl overflow-hidden shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-blue-800/50">
            {stats.map((stat, index) => (
              <div key={index} className="px-6 py-10 text-center">
                <div className="text-4xl font-extrabold text-white mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-blue-200 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
