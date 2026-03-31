import { useState, useEffect, useCallback } from 'react';
import { SlidersHorizontal, X, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { AlumniDirectoryItem, PaginationInfo } from '../types';
import AlumniCard from '../components/AlumniCard';
import FilterSidebar, { FiltersState } from '../components/FilterSidebar';
import RequestModal from '../components/RequestModal';
import { AlumniCardSkeleton } from '../components/LoadingSkeleton';
import api from '../lib/axios';

const DEFAULT_FILTERS: FiltersState = {
  search: '',
  industries: [],
  mentorshipAreas: [],
  minRating: 'any',
  acceptingOnly: false,
  gradYearMin: '',
  gradYearMax: '',
};

export default function Directory() {
  const [alumni, setAlumni] = useState<AlumniDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState<PaginationInfo>({ total: 0, page: 1, pages: 1, limit: 12 });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requestTarget, setRequestTarget] = useState<AlumniDirectoryItem | null>(null);

  const fetchAlumni = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = {
        page,
        limit: 12,
      };
      if (filters.search) params.search = filters.search;
      if (filters.industries.length > 0) params.industries = filters.industries.join(',');
      if (filters.mentorshipAreas.length > 0) params.mentorshipAreas = filters.mentorshipAreas.join(',');
      if (filters.minRating !== 'any') params.minRating = filters.minRating;
      if (filters.acceptingOnly) params.acceptingOnly = true;
      if (filters.gradYearMin) params.gradYearMin = filters.gradYearMin;
      if (filters.gradYearMax) params.gradYearMax = filters.gradYearMax;

      const response = await api.get('/alumni', { params });
      const data = response.data.data;
      setAlumni(data.alumni || []);
      if (data.pagination) {
        setPagination(data.pagination);
      } else {
        setPagination({ total: 0, page: 1, pages: 1, limit: 12 });
      }
    } catch {
      toast.error('Failed to load alumni directory');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => fetchAlumni(1), 300);
    return () => clearTimeout(timer);
  }, [fetchAlumni]);

  const handleRequest = async (alumnus: AlumniDirectoryItem, data: { topic: string; message: string; proposedSlots: string[] }) => {
    try {
      await api.post('/requests', {
        alumniId: (alumnus.profile.userId as { _id: string })?._id || alumnus.profile.userId,
        topic: data.topic,
        message: data.message,
        proposedSlots: data.proposedSlots,
      });
      toast.success('Mentorship request sent successfully!');
      setRequestTarget(null);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to send request');
      throw error;
    }
  };

  const activeFilterCount =
    filters.industries.length +
    filters.mentorshipAreas.length +
    (filters.minRating !== 'any' ? 1 : 0) +
    (filters.acceptingOnly ? 1 : 0) +
    (filters.gradYearMin ? 1 : 0) +
    (filters.gradYearMax ? 1 : 0) +
    (filters.search ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alumni Directory</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {loading ? 'Loading...' : `${pagination.total} mentor${pagination.total !== 1 ? 's' : ''} available`}
          </p>
        </div>
        {/* Mobile filter toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden flex items-center gap-2 btn-secondary relative"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Filter Sidebar - Desktop */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <FilterSidebar filters={filters} onFilterChange={setFilters} />
        </div>

        {/* Filter Sidebar - Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 dark:text-white">Filters</h2>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <FilterSidebar filters={filters} onFilterChange={(f) => { setFilters(f); }} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.search && (
                <span className="inline-flex items-center gap-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-3 py-1 rounded-full text-sm">
                  Search: {filters.search}
                  <button onClick={() => setFilters({ ...filters, search: '' })}><X className="w-3 h-3" /></button>
                </span>
              )}
              {filters.industries.map((ind) => (
                <span key={ind} className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
                  {ind}
                  <button onClick={() => setFilters({ ...filters, industries: filters.industries.filter((i) => i !== ind) })}><X className="w-3 h-3" /></button>
                </span>
              ))}
              {filters.acceptingOnly && (
                <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm">
                  Accepting only
                  <button onClick={() => setFilters({ ...filters, acceptingOnly: false })}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <AlumniCardSkeleton key={i} />)}
            </div>
          ) : alumni.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No alumni found</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                Try adjusting your filters or search terms to find the right mentor for you.
              </p>
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="mt-4 btn-primary"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {alumni.map((item) => (
                  <AlumniCard
                    key={item.user._id}
                    user={item.user}
                    profile={item.profile}
                    onRequest={() => setRequestTarget(item)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => fetchAlumni(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(pagination.pages, 7) }).map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => fetchAlumni(page)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          page === pagination.page
                            ? 'bg-primary-600 text-white'
                            : 'border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => fetchAlumni(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Request Modal */}
      {requestTarget && (
        <RequestModal
          alumni={requestTarget}
          onClose={() => setRequestTarget(null)}
          onSubmit={(data) => handleRequest(requestTarget, data)}
        />
      )}
    </div>
  );
}
