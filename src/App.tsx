import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import FocusAreas from './components/FocusAreas';
import Members from './components/Members';
import Resources from './components/Resources';
import News from './components/News';
import Partners from './components/Partners';
import Footer from './components/Footer';
import AdminDashboard from './components/admin/AdminDashboard';
import ExternalPartners from './pages/ExternalPartners';
import { ErrorBoundary } from './components/ErrorBoundary';

import AboutUs from './pages/AboutUs';
import Leadership from './pages/Leadership';
import Gallery from './pages/Gallery';

function SimplePage({ title, content }: { title: string, content: string }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-8">{title}</h1>
        <div className="prose prose-slate max-w-none bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-lg text-slate-600 leading-relaxed">{content}</p>
          <p className="text-slate-600 leading-relaxed mt-4">
            This is a placeholder page. In a production environment, this would contain the full legal text for the {title}.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      // Small delay to ensure components are mounted
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <main>
        <Hero />
        <About />
        <FocusAreas />
        <Members />
        <Resources />
        <News />
        <Partners />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<><Navbar /><AboutUs /><Footer /></>} />
            <Route path="/leadership/primates" element={<><Navbar /><Leadership /><Footer /></>} />
            <Route path="/leadership/standing-committee" element={<><Navbar /><Leadership /><Footer /></>} />
            <Route path="/leadership/trustees" element={<><Navbar /><Leadership /><Footer /></>} />
            <Route path="/gallery" element={<><Navbar /><Gallery /><Footer /></>} />
            <Route path="/external-partners" element={<ExternalPartners />} />
            <Route path="/privacy" element={<SimplePage title="Privacy Policy" content="We take your privacy seriously. This policy describes what personal information we collect and how we use it." />} />
            <Route path="/terms" element={<SimplePage title="Terms of Service" content="By using our website, you agree to these terms of service. Please read them carefully." />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
