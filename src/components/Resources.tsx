import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Download, BookOpen, ExternalLink, FileDown, Search, Filter, ArrowUpDown, Tag, Info, X, ChevronRight, ChevronLeft, LayoutGrid, Eye, Share2, ChevronDown, Sparkles, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

function FilterDropdown({ icon: Icon, value, options, onChange }: { icon: any, value: string, options: {value: string, label: string}[], onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div className="relative" ref={ref}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between pl-9 pr-4 py-2.5 text-sm border-slate-200 rounded-xl bg-slate-50 border font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 hover:shadow-sm transition-all text-left group"
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-4 w-4 text-blue-500 group-hover:text-blue-600 transition-colors" />
        </div>
        <span className="truncate block">{selectedOption.label}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-all duration-200 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto"
          >
            {options.map(opt => (
              <motion.button
                key={opt.value}
                whileHover={{ x: 4, backgroundColor: 'rgb(248 250 252)' }}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                  value === opt.value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'
                }`}
              >
                {opt.label}
                {value === opt.value && <motion.div layoutId={`check-${options[0].label}`} className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Resources() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAbout, setShowAbout] = useState(false);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  
  // Image Generation
  const [showGenerator, setShowGenerator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await api.get('/resources');
        // Sort by createdAt desc
        const sorted = data.sort((a: any, b: any) => {
          const dateA = new Date(a.date || a.createdAt || 0).getTime();
          const dateB = new Date(b.date || b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        const resourcesData = sorted.map((res: any) => {
          let parsedTags = [];
          if (Array.isArray(res.tags)) {
            parsedTags = res.tags;
          } else if (typeof res.tags === 'string') {
            try {
              parsedTags = JSON.parse(res.tags);
              if (!Array.isArray(parsedTags)) parsedTags = [];
            } catch (e) {
              // If not JSON, maybe it's comma separated?
              parsedTags = res.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t !== '');
            }
          }
          
          return {
            ...res,
            url: res.url || res.fileUrl || '#',
            tags: parsedTags,
            icon: FileText,
            type: res.type || 'PDF',
            size: res.size || '0 KB'
          };
        });
        setResources(resourcesData);
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    setGeneratedImage(null);
    try {
      const prompt = `A beautiful, inspiring, high-quality illustration representing the concept of "${selectedCategory === 'All' ? 'Community Development and Faith' : selectedCategory}" in the context of African community development, hope, and faith.`;
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate image');
      }
      
      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else {
        throw new Error('No image URL returned');
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const types = ['All', ...Array.from(new Set(resources.map(r => r.type)))];
  const categories = ['All', ...Array.from(new Set(resources.map(r => r.category)))];
  const allTags = ['All', ...Array.from(new Set(resources.flatMap(r => r.tags || [])))].sort();
  const featuredResources = resources.filter(r => r.featured);

  const tagOptions = allTags.map(tag => ({ value: tag, label: tag === 'All' ? 'All Tags' : tag }));
  const typeOptions = types.map(type => ({ value: type, label: type === 'All' ? 'All Types' : type }));
  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'date', label: 'Newest First' },
    { value: 'title', label: 'Alphabetical (A-Z)' },
    { value: 'size', label: 'File Size' }
  ];

  const getRelevanceScore = (resource: any, query: string) => {
    if (!query) return 0;
    const q = query.toLowerCase();
    let score = 0;
    if (resource.title.toLowerCase() === q) score += 100;
    if (resource.title.toLowerCase().includes(q)) score += 50;
    if ((resource.tags || []).some((t: string) => t.toLowerCase().includes(q))) score += 30;
    if (resource.category.toLowerCase().includes(q)) score += 20;
    if (resource.description.toLowerCase().includes(q)) score += 10;
    return score;
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, sortBy, selectedTag, selectedCategory]);

  const filteredAndSortedResources = useMemo(() => {
    let result = resources.filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            resource.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (resource.tags || []).some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = filterType === 'All' || resource.type === filterType;
      const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;
      const matchesTag = selectedTag === 'All' || (resource.tags || []).includes(selectedTag);
      return matchesSearch && matchesType && matchesCategory && matchesTag;
    });

    result.sort((a, b) => {
      if (sortBy === 'relevance' && searchQuery) {
        return getRelevanceScore(b, searchQuery) - getRelevanceScore(a, searchQuery);
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'date' || (sortBy === 'relevance' && !searchQuery)) {
        return new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime();
      } else if (sortBy === 'size') {
        return parseFloat(a.size || '0') - parseFloat(b.size || '0');
      }
      return 0;
    });

    return result;
  }, [resources, searchQuery, filterType, sortBy, selectedTag, selectedCategory]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedResources.length / itemsPerPage);
  const currentResources = filteredAndSortedResources.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleShare = async (resource: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: resource.title,
          text: resource.description,
          url: resource.url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(resource.url);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) return null;

  return (
    <section id="resources" className="py-24 bg-slate-50 border-t border-slate-200 relative overflow-hidden scroll-mt-20">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        <div className="absolute top-40 -left-40 w-96 h-96 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-sm font-bold text-blue-600 tracking-widest uppercase">Resources</h2>
              <span className="h-px w-12 bg-blue-600"></span>
            </div>
            <p className="text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Publications & Documents
            </p>
            <p className="mt-4 text-xl text-slate-600">
              Access our collection of reports, toolkits, and liturgical resources designed to support the Anglican Church in Africa.
            </p>
          </div>
          <button 
            onClick={() => setShowAbout(true)}
            className="inline-flex items-center px-5 py-2.5 bg-white border border-slate-200 shadow-sm text-sm font-medium rounded-full text-blue-700 hover:bg-blue-50 hover:border-blue-200 transition-all"
          >
            <Info className="mr-2 h-4 w-4" />
            About Resources
          </button>
        </div>

        {/* Featured Resources Carousel */}
        <div className="mb-16">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
            Featured Resources
            <span className="ml-3 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">Highlights</span>
          </h3>
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            {featuredResources.map((resource, index) => (
              <motion.div
                key={`featured-${resource.title}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="snap-center shrink-0 w-[85vw] sm:w-96 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col h-[380px] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <resource.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{resource.category}</span>
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 min-h-[3.5rem]">{resource.title}</h4>
                <p className="text-sm text-slate-500 mb-6 line-clamp-3 min-h-[3.75rem]">{resource.description}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                  <div className="flex gap-2 overflow-hidden">
                    {resource.tags.slice(0, 2).map(tag => (
                      <motion.button 
                        key={tag} 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); setSelectedTag(tag); }}
                        className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 px-2 py-1 rounded-md whitespace-nowrap transition-colors"
                      >
                        {tag}
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleShare(resource); }}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      aria-label={`Share ${resource.title}`}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setSelectedResource(resource)}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
                      aria-label={`View ${resource.title}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mb-10">
          <div className="flex flex-col gap-6">
            {/* Search Bar */}
            <motion.div 
              whileHover={{ scale: 1.01 }} 
              className="relative w-full"
            >
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all sm:text-sm hover:border-blue-300 hover:shadow-sm"
                placeholder="Search resources by title, description, category or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </motion.div>
            
            {/* Categories as Interactive Pills */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Categories</h4>
                <button 
                  onClick={() => setShowGenerator(true)}
                  className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Visualize Category
                </button>
              </div>
              <div className="flex overflow-x-auto pb-2 -mx-2 px-2 gap-2 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                {categories.map(cat => (
                  <motion.button
                    key={cat}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(cat)}
                    className={`relative whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                      selectedCategory === cat 
                        ? 'text-white border-transparent shadow-sm' 
                        : 'bg-slate-100 text-slate-600 border-transparent hover:bg-blue-50 hover:text-blue-700 hover:border-blue-100 hover:shadow-sm'
                    }`}
                  >
                    {selectedCategory === cat && (
                      <motion.div
                        layoutId="activeCategory"
                        className="absolute inset-0 bg-blue-600 rounded-full shadow-md shadow-blue-200"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{cat === 'All' ? 'All Categories' : cat}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Other Filters (Dropdowns) */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Filter by Tag</label>
                <FilterDropdown icon={Tag} value={selectedTag} options={tagOptions} onChange={setSelectedTag} />
              </div>

              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Filter by Type</label>
                <FilterDropdown icon={Filter} value={filterType} options={typeOptions} onChange={setFilterType} />
              </div>
              
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sort By</label>
                <FilterDropdown icon={ArrowUpDown} value={sortBy} options={sortOptions} onChange={setSortBy} />
              </div>
            </div>
          </div>
        </div>

        {/* Resources List */}
        <div className="space-y-4 mb-10">
          <AnimatePresence mode="popLayout">
            {currentResources.length > 0 ? (
              currentResources.map((resource, index) => (
                <motion.div
                  layout
                  key={resource.title}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center p-5 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group"
                >
                  <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                    <div className="w-14 h-14 bg-slate-50 text-slate-500 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <resource.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md">{resource.category}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">{resource.type}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">{resource.size}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1.5 group-hover:text-blue-600 transition-colors truncate">{resource.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-1 mb-3">{resource.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      {resource.tags.map(tag => (
                        <motion.button 
                          key={tag} 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => { e.stopPropagation(); setSelectedTag(tag); }}
                          className="text-[10px] font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 px-2 py-1 rounded-md transition-colors"
                        >
                          #{tag}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-6 flex-shrink-0 w-full sm:w-auto flex justify-end gap-2 sm:gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleShare(resource); }}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                      aria-label={`Share ${resource.title}`}
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setSelectedResource(resource)}
                      className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors flex-1 sm:flex-none" 
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Details
                    </button>
                    <a 
                      href={resource.url}
                      download={`${resource.title.replace(/\s+/g, '_')}.pdf`}
                      className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex-1 sm:flex-none shadow-sm shadow-blue-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 outline-none" 
                      aria-label={`Download ${resource.title} (${resource.type}, ${resource.size})`}
                      title={`Download ${resource.title}`}
                    >
                      <Download className="w-4 h-4 sm:mr-2" aria-hidden="true" />
                      <span className="hidden sm:inline">Download</span>
                      <span className="sr-only"> {resource.title} file</span>
                    </a>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No resources found</h3>
                <p className="text-slate-500 max-w-md mx-auto">We couldn't find any resources matching your current filters. Try adjusting your search or clearing the filters.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setFilterType('All'); setSelectedTag('All'); setSelectedCategory('All'); setSortBy('relevance'); }}
                  className="mt-6 inline-flex items-center px-5 py-2.5 bg-blue-50 text-blue-700 font-medium rounded-full hover:bg-blue-100 transition-colors"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-16">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              {Array.from({ length: totalPages }).map((_, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: currentPage === i + 1 ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`relative w-10 h-10 rounded-lg font-medium text-sm transition-colors ${
                    currentPage === i + 1 
                      ? 'text-white' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  {currentPage === i + 1 && (
                    <motion.div
                      layoutId="activePage"
                      className="absolute inset-0 bg-blue-600 rounded-lg shadow-sm shadow-blue-200"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{i + 1}</span>
                </motion.button>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Resource Details Modal */}
      <AnimatePresence>
        {selectedResource && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            onClick={() => setSelectedResource(null)}
          >
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6 border-b border-slate-100 flex items-start justify-between flex-shrink-0">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <selectedResource.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase tracking-wider truncate">{selectedResource.category}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 line-clamp-2 break-words">{selectedResource.title}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedResource(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0 ml-4"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 sm:p-6 bg-slate-50/50 overflow-y-auto flex-1 min-h-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-6 break-words">
                  {selectedResource.description}
                </p>
                
                {/* Document Preview Section */}
                <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 bg-white h-40 sm:h-64 shadow-inner relative flex-shrink-0">
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                     <FileText className="w-10 h-10 sm:w-12 sm:h-12 mb-3 opacity-50" />
                     <span className="text-sm font-medium">Loading Preview...</span>
                  </div>
                  <iframe 
                    src={`${selectedResource.url}#toolbar=0&navpanes=0&scrollbar=0`} 
                    title={`Preview of ${selectedResource.title}`}
                    className="w-full h-full relative z-10"
                  />
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="block text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Type</span>
                    <span className="font-medium text-sm sm:text-base text-slate-900">{selectedResource.type}</span>
                  </div>
                  <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="block text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Size</span>
                    <span className="font-medium text-sm sm:text-base text-slate-900">{selectedResource.size}</span>
                  </div>
                  <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="block text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Date</span>
                    <span className="font-medium text-sm sm:text-base text-slate-900">{new Date(selectedResource.date).toLocaleDateString()}</span>
                  </div>
                  <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="block text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Access</span>
                    <span className="font-medium text-sm sm:text-base text-emerald-600">Public</span>
                  </div>
                </div>

                <div className="mb-2">
                  <span className="block text-sm font-semibold text-slate-900 mb-3">Associated Tags</span>
                  <div className="flex gap-2 flex-wrap">
                    {selectedResource.tags.map((tag: string) => (
                      <span key={tag} className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-end gap-3 flex-shrink-0">
                <button 
                  onClick={() => handleShare(selectedResource)}
                  className="inline-flex items-center justify-center px-4 py-3 bg-slate-50 text-slate-700 font-medium rounded-xl hover:bg-slate-100 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 outline-none w-full sm:w-auto"
                  aria-label={`Share ${selectedResource.title}`}
                  title={`Share ${selectedResource.title}`}
                >
                  <Share2 className="w-5 h-5 sm:mr-2" aria-hidden="true" />
                  <span className="sm:inline">Share</span>
                </button>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <a 
                    href={selectedResource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 outline-none w-full sm:w-auto"
                    aria-label={`Read ${selectedResource.title} in a new tab`}
                    title={`Read ${selectedResource.title}`}
                  >
                    <BookOpen className="w-5 h-5 mr-2" aria-hidden="true" />
                    Read
                  </a>
                  <a 
                    href={selectedResource.url}
                    download={`${selectedResource.title.replace(/\s+/g, '_')}.pdf`}
                    className="inline-flex items-center justify-center px-6 sm:px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 outline-none w-full sm:w-auto"
                    aria-label={`Download ${selectedResource.title} (${selectedResource.type}, ${selectedResource.size})`}
                    title={`Download ${selectedResource.title}`}
                  >
                    <Download className="w-5 h-5 mr-2" aria-hidden="true" />
                    <span className="hidden sm:inline">Download File ({selectedResource.size})</span>
                    <span className="sm:hidden">Download ({selectedResource.size})</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* About Resources Modal */}
      <AnimatePresence>
        {showAbout && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            onClick={() => setShowAbout(false)}
          >
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                  <Info className="w-5 h-5 mr-2 text-blue-600" />
                  About Our Resources
                </h3>
                <button 
                  onClick={() => setShowAbout(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 sm:p-6 sm:p-8 overflow-y-auto flex-1 min-h-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 leading-relaxed mb-6">
                    The Council of Anglican Provinces of Africa (CAPA) is committed to equipping the church with high-quality, relevant, and accessible materials. Our resource center serves as a central repository for:
                  </p>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                        <BookOpen className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-slate-700"><strong>Liturgical Materials:</strong> Including the CAPA Prayer Cycle and regional worship guides.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                        <FileText className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-slate-700"><strong>Strategic Documents:</strong> Five-year plans, annual reports, and policy frameworks.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                        <FileDown className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-slate-700"><strong>Implementation Toolkits:</strong> Practical guides for community mobilization, youth leadership, and environmental stewardship.</span>
                    </li>
                  </ul>
                  <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                    <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">Need Help?</h4>
                    <p className="text-sm text-blue-700 mb-0">
                      If you cannot find a specific document or require materials in a different language format, please contact our communications office at <a href="mailto:info@capa-hq.org" className="font-semibold underline hover:text-blue-900">info@capa-hq.org</a>.
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-4 sm:px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end flex-shrink-0">
                <button 
                  onClick={() => setShowAbout(false)}
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Generator Modal */}
      <AnimatePresence>
        {showGenerator && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            onClick={() => setShowGenerator(false)}
          >
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                  Visualize Category
                </h3>
                <button 
                  onClick={() => setShowGenerator(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 sm:p-6 sm:p-8 overflow-y-auto flex-1 flex flex-col items-center min-h-0">
                <p className="text-slate-600 text-center mb-6">
                  Generate an inspiring illustration based on the currently selected category: <strong className="text-slate-900">{selectedCategory === 'All' ? 'Community Development and Faith' : selectedCategory}</strong>.
                </p>
                
                <div className="w-full max-w-md aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative mb-6">
                  {isGenerating ? (
                    <div className="flex flex-col items-center text-blue-600">
                      <Loader2 className="w-10 h-10 animate-spin mb-3" />
                      <span className="text-sm font-medium">Generating image...</span>
                    </div>
                  ) : generatedImage ? (
                    <img src={generatedImage} alt={`Generated illustration for ${selectedCategory}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <Sparkles className="w-10 h-10 mb-3 opacity-50" />
                      <span className="text-sm font-medium">Image will appear here</span>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={handleGenerateImage}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Image
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
