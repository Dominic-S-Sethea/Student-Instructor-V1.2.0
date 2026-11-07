import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  BookOpen,
  Sparkles,
  ExternalLink,
  Layers,
  GraduationCap,
  Brain,
  Award,
  Users,
  Compass,
  Zap,
  Tag
} from 'lucide-react';
import { ClientKnowledgeDoc } from '../../types';

interface SearchResultItem {
  id: string;
  title: string;
  category: string;
  source: string;
  snippet: string;
  relevanceScore: number;
}

export const AIKnowledgeSearchView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [documents, setDocuments] = useState<ClientKnowledgeDoc[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  // Vector search sandbox
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultItem[] | null>(null);

  const categories = [
    { name: 'all', label: 'All Domains', icon: Layers, count: 14 },
    { name: 'Education Science', label: 'Education Science', icon: GraduationCap, count: 2 },
    { name: 'Psychology', label: 'Psychology', icon: Brain, count: 2 },
    { name: 'Career Intelligence', label: 'Career Intelligence', icon: Compass, count: 2 },
    { name: 'University Knowledge', label: 'University Knowledge', icon: BookOpen, count: 2 },
    { name: 'Scholarship Knowledge', label: 'Scholarship Knowledge', icon: Award, count: 2 },
    { name: 'Teaching Methodology', label: 'Teaching Methodology', icon: Zap, count: 2 },
    { name: 'Child Development', label: 'Child Development', icon: Users, count: 2 },
  ];

  const fetchDocs = async (category?: string) => {
    setIsLoadingDocs(true);
    try {
      const url = category && category !== 'all'
        ? `/api/ai/knowledge?category=${encodeURIComponent(category)}`
        : '/api/ai/knowledge';
      const res = await fetch(url);
      const data = await res.json();
      if (data && Array.isArray(data.documents)) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error('Failed to load knowledge documents:', err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocs(activeCategory);
  }, [activeCategory]);

  const handleVectorSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch('/api/ai/knowledge/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery.trim(),
          category: activeCategory !== 'all' ? activeCategory : undefined,
          topK: 4
        })
      });
      const data = await res.json();
      if (data && Array.isArray(data.results)) {
        setSearchResults(data.results);
      }
    } catch (err) {
      console.error('Vector search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl border border-indigo-800/60 shadow-md">
        <div className="flex items-center space-x-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center">
            <Database className="w-4 h-4 text-indigo-300" />
          </div>
          <h2 className="text-lg font-bold">CDES Vector Knowledge Base & RAG Index</h2>
        </div>
        <p className="text-xs text-indigo-200/90 leading-relaxed max-w-2xl">
          The Personal Education Intelligence Agent grounds every student recommendation in a 128-dimensional dense vector space indexed across Cambodia’s premier universities, MPTC scholarships, and verified cognitive science research.
        </p>

        {/* Vector Search Sandbox Bar */}
        <form onSubmit={handleVectorSearch} className="mt-5 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Test semantic search (e.g. 'How does Snell's law connect to high school Bac II?', 'CADT software tuition')..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 rounded-xl text-xs text-white placeholder:text-indigo-200/60 focus:outline-hidden focus:ring-2 focus:ring-indigo-400 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold text-xs rounded-xl flex items-center space-x-1.5 transition-colors shadow-sm disabled:opacity-60"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
            <span>Search Vectors</span>
          </button>
        </form>

        {/* Quick Sample Queries */}
        <div className="flex items-center space-x-2 mt-3 text-[11px] text-indigo-300/80 overflow-x-auto pb-1">
          <span className="font-semibold text-indigo-200 whitespace-nowrap">Try queries:</span>
          {[
            'MPTC Digital Skills Scholarship eligibility',
            'ITC Tronc Commun curriculum structure',
            'Cognitive Load Theory and STEM learning',
            'Snell law physics derivation'
          ].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                setSearchQuery(q);
                // Trigger fetch automatically
                fetch('/api/ai/knowledge/search', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ query: q, topK: 4 })
                })
                  .then(r => r.json())
                  .then(data => {
                    if (data?.results) setSearchResults(data.results);
                  });
              }}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-indigo-100 whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Semantic Search Results (if query executed) */}
      {searchResults && (
        <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-5 shadow-xs animate-fade-in space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-stone-900 text-sm">
                Semantic Vector Search Results ({searchResults.length} matches retrieved)
              </h3>
            </div>
            <button
              onClick={() => setSearchResults(null)}
              className="text-xs text-stone-500 hover:text-stone-800 underline"
            >
              Clear Results
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {searchResults.map((res, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {res.category}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {Math.round(res.relevanceScore * 100)}% Cosine Match
                  </span>
                </div>
                <h4 className="font-bold text-stone-900 text-xs mb-1">{res.title}</h4>
                <p className="text-[11px] text-stone-600 leading-relaxed line-clamp-3 mb-2">
                  {res.snippet}
                </p>
                <div className="text-[10px] text-stone-400 font-medium">
                  Source: {res.source}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-50 border-stone-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Documents Grid */}
      {isLoadingDocs ? (
        <div className="p-12 text-center text-stone-400 bg-white rounded-2xl border border-stone-200">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm">Loading knowledge domain corpus...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="p-12 text-center text-stone-500 bg-white rounded-2xl border border-stone-200">
          <p className="font-semibold text-sm">No documents found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-stone-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-stone-100 text-stone-700 border border-stone-200">
                    {doc.category}
                  </span>
                  <span className="text-[11px] text-stone-400">128-dim Vector Indexed</span>
                </div>

                <h3 className="font-bold text-stone-900 text-sm mb-2">{doc.title}</h3>
                <div className="text-xs text-stone-600 leading-relaxed mb-4 max-h-36 overflow-y-auto pr-1">
                  {doc.content}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <span className="truncate max-w-[240px]">Source: {doc.source || 'CDES Intelligence Repository'}</span>
                <span className="font-mono text-stone-400">ID: {doc.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
