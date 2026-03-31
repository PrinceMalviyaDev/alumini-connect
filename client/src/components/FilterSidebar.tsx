import { Search, X } from 'lucide-react';

const INDUSTRIES = [
  'Tech',
  'Finance',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Consulting',
  'Media',
  'Retail',
  'Government',
  'Other',
];

const MENTORSHIP_AREAS = [
  'Resume Review',
  'Interview Prep',
  'Career Guidance',
  'Technical Skills',
  'Networking',
  'Leadership',
  'Entrepreneurship',
  'Graduate School',
  'Work-Life Balance',
  'Industry Insights',
];

export interface FiltersState {
  search: string;
  industries: string[];
  mentorshipAreas: string[];
  minRating: string;
  acceptingOnly: boolean;
  gradYearMin: string;
  gradYearMax: string;
}

interface FilterSidebarProps {
  filters: FiltersState;
  onFilterChange: (filters: FiltersState) => void;
}

export default function FilterSidebar({ filters, onFilterChange }: FilterSidebarProps) {
  const update = (key: keyof FiltersState, value: FiltersState[keyof FiltersState]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleArrayItem = (key: 'industries' | 'mentorshipAreas', item: string) => {
    const arr = filters[key];
    const updated = arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
    update(key, updated);
  };

  const clearAll = () => {
    onFilterChange({
      search: '',
      industries: [],
      mentorshipAreas: [],
      minRating: 'any',
      acceptingOnly: false,
      gradYearMin: '',
      gradYearMax: '',
    });
  };

  const hasFilters =
    filters.search ||
    filters.industries.length > 0 ||
    filters.mentorshipAreas.length > 0 ||
    filters.minRating !== 'any' ||
    filters.acceptingOnly ||
    filters.gradYearMin ||
    filters.gradYearMax;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 dark:text-white">Filters</h2>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="label">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Accepting Requests Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Accepting Requests</label>
        <button
          onClick={() => update('acceptingOnly', !filters.acceptingOnly)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            filters.acceptingOnly ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              filters.acceptingOnly ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Min Rating */}
      <div>
        <label className="label">Minimum Rating</label>
        <div className="space-y-2">
          {[
            { value: 'any', label: 'Any rating' },
            { value: '4', label: '4+ stars' },
            { value: '4.5', label: '4.5+ stars' },
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="minRating"
                value={option.value}
                checked={filters.minRating === option.value}
                onChange={() => update('minRating', option.value)}
                className="text-primary-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Industry */}
      <div>
        <label className="label">Industry</label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {INDUSTRIES.map((industry) => (
            <label key={industry} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.industries.includes(industry)}
                onChange={() => toggleArrayItem('industries', industry)}
                className="rounded text-primary-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{industry}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Mentorship Areas */}
      <div>
        <label className="label">Mentorship Areas</label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {MENTORSHIP_AREAS.map((area) => (
            <label key={area} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.mentorshipAreas.includes(area)}
                onChange={() => toggleArrayItem('mentorshipAreas', area)}
                className="rounded text-primary-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{area}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Graduation Year Range */}
      <div>
        <label className="label">Graduation Year</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="From"
            value={filters.gradYearMin}
            onChange={(e) => update('gradYearMin', e.target.value)}
            min="1990"
            max="2030"
            className="input-field"
          />
          <input
            type="number"
            placeholder="To"
            value={filters.gradYearMax}
            onChange={(e) => update('gradYearMax', e.target.value)}
            min="1990"
            max="2030"
            className="input-field"
          />
        </div>
      </div>
    </div>
  );
}
