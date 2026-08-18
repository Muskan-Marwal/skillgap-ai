import React, { useState } from 'react';
import { Search, MapPin, Globe, Database, Sparkles, Filter } from 'lucide-react';

const QUICK_ROLES = [
  'Data Scientist',
  'Python Developer',
  'Machine Learning Engineer',
  'Data Analyst',
  'Full Stack Python Developer',
];

export const JobSearch = ({ onSearch, loading }) => {
  const [query, setQuery] = useState('Data Scientist');
  const [location, setLocation] = useState('London');
  const [country, setCountry] = useState('gb');
  const [useCacheOnly, setUseCacheOnly] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch({
      query: query.trim(),
      location: location.trim(),
      country,
      use_cache_only: useCacheOnly,
      results_per_page: 15,
      page: 1,
    });
  };

  const handleChipClick = (role) => {
    setQuery(role);
    onSearch({
      query: role,
      location: location.trim(),
      country,
      use_cache_only: useCacheOnly,
      results_per_page: 15,
      page: 1,
    });
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Target Role */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Target Role (e.g. Data Scientist, Python Dev)"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
              required
            />
          </div>

          {/* Location */}
          <div className="md:col-span-3 relative">
            <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (e.g. London, Remote)"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
            />
          </div>

          {/* Country Selector */}
          <div className="md:col-span-2 relative">
            <Globe className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition appearance-none cursor-pointer"
            >
              <option value="gb">UK (Adzuna GB)</option>
              <option value="us">USA (Adzuna US)</option>
              <option value="in">India (Adzuna IN)</option>
            </select>
          </div>

          {/* Submit Search Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-full min-h-[42px] inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-sky-600/20"
            >
              <Search className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Searching...' : 'Find Jobs'}
            </button>
          </div>
        </div>

        {/* Options & Cache Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs">
          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Popular Roles:
            </span>
            {QUICK_ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleChipClick(role)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              >
                {role}
              </button>
            ))}
          </div>

          {/* Offline / Cache Only Checkbox */}
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useCacheOnly}
              onChange={(e) => setUseCacheOnly(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-sky-500 focus:ring-sky-500 w-4 h-4 cursor-pointer"
            />
            <span className="flex items-center gap-1.5 text-slate-400">
              <Database className="w-3.5 h-3.5 text-emerald-400" /> Search Local SQLite Cache Only
            </span>
          </label>
        </div>
      </form>
    </div>
  );
};
