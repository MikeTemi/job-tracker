'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2, ExternalLink, Calendar, Building, Brain, ArrowUpDown, Download, Menu, X } from 'lucide-react';
import { Job, JobStatus } from '@/types/job';
import AddJobForm from '@/components/AddJobForm';
import AIAnalysis from '@/components/AIAnalysis';

export default function ApplicationsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [aiAnalysisJob, setAiAnalysisJob] = useState<Job | null>(null);
  
  // Enhanced search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('dateApplied');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const jobsPerPage = 10;

  useEffect(() => {
    fetchJobs();
  }, []);

  // Enhanced filtering and sorting
  useEffect(() => {
    let filtered = jobs || [];

    // Search filter - only search title and company
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Job];
      let bValue: any = b[sortBy as keyof Job];
      
      if (sortBy === 'dateApplied') {
        aValue = a.dateApplied ? new Date(a.dateApplied).getTime() : 0;
        bValue = b.dateApplied ? new Date(b.dateApplied).getTime() : 0;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [jobs, searchTerm, statusFilter, sortBy, sortOrder]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs');
      const data = await response.json();
      
      if (data.success) {
        const jobsWithDates = data.jobs.map((job: any) => ({
          ...job,
          dateApplied: job.dateApplied ? new Date(job.dateApplied) : new Date(),
          createdAt: job.createdAt ? new Date(job.createdAt) : new Date(),
          updatedAt: job.updatedAt ? new Date(job.updatedAt) : new Date()
        }));
        setJobs(jobsWithDates);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch jobs');
      }
    } catch (err) {
      setError('An error occurred while fetching jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string, jobTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${jobTitle}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchJobs();
      } else {
        alert('Failed to delete job: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('An error occurred while deleting the job');
    }
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setIsAddFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsAddFormOpen(false);
    setEditingJob(null);
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.APPLIED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case JobStatus.INTERVIEWING:
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case JobStatus.OFFER:
        return 'bg-green-100 text-green-800 border-green-200';
      case JobStatus.REJECTED:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Job Title', 'Company', 'Status', 'Date Applied', 'Application Link'];
    const csvData = filteredJobs.map(job => [
      job.title,
      job.company,
      job.status,
      job.dateApplied ? new Date(job.dateApplied).toLocaleDateString() : 'N/A',
      job.applicationLink || 'N/A'
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-applications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Pagination
  const totalPages = Math.ceil((filteredJobs?.length || 0) / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const paginatedJobs = filteredJobs?.slice(startIndex, startIndex + jobsPerPage) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 text-sm sm:text-base">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-md w-full">
          <div className="text-center">
            <div className="bg-red-100 rounded-full p-3 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4">
              <svg className="w-6 h-6 sm:w-10 sm:h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4 text-sm">{error}</p>
            <button 
              onClick={fetchJobs}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* Enhanced Responsive Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Job Applications
              </h1>
              <p className="text-slate-600 mt-2 text-sm sm:text-base">
                Manage all your job applications in one place
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-xs sm:text-sm text-slate-500">
                <span>{filteredJobs.length} applications</span>
                <span>•</span>
                <span>{jobs.filter(j => j.status === JobStatus.APPLIED).length} pending</span>
                <span>•</span>
                <span>{jobs.filter(j => j.status === JobStatus.INTERVIEWING).length} in process</span>
              </div>
            </div>
            
            {/* Action Buttons - Responsive */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button
                onClick={() => setIsAddFormOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group text-sm"
              >
                <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
                <span>Add Application</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Responsive Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 mb-6">
          <div className="space-y-4">
            
            {/* Search Bar - Always visible */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by job title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm sm:text-base"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors text-sm"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {showFilters ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>

            {/* Filters - Responsive Layout */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Status Filter */}
                <div className="relative flex-1 sm:flex-none">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors appearance-none bg-white text-sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value={JobStatus.APPLIED}>Applied</option>
                    <option value={JobStatus.INTERVIEWING}>Interviewing</option>
                    <option value={JobStatus.OFFER}>Offer</option>
                    <option value={JobStatus.REJECTED}>Rejected</option>
                  </select>
                </div>

                {/* Sort Filter */}
                <div className="relative flex-1 sm:flex-none">
                  <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field);
                      setSortOrder(order as 'asc' | 'desc');
                    }}
                    className="w-full pl-10 pr-8 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors appearance-none bg-white text-sm"
                  >
                    <option value="dateApplied-desc">Newest First</option>
                    <option value="dateApplied-asc">Oldest First</option>
                    <option value="title-asc">Title A-Z</option>
                    <option value="title-desc">Title Z-A</option>
                    <option value="company-asc">Company A-Z</option>
                    <option value="company-desc">Company Z-A</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Jobs Display - Mobile Cards + Desktop Table */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 sm:p-12 text-center">
            <div className="bg-slate-100 rounded-full p-3 sm:p-4 w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4">
              <Building className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No applications found' : 'No applications yet'}
            </h3>
            <p className="text-slate-600 mb-6 text-sm sm:text-base px-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Start tracking your job applications by adding your first one'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => setIsAddFormOpen(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                Add Your First Application
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="lg:hidden space-y-4">
              {paginatedJobs.map((job) => (
                <div key={job.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 hover:shadow-xl transition-all duration-200">
                  
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-base truncate">{job.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Building className="h-3 w-3 text-slate-400 flex-shrink-0" />
                        <span className="text-sm text-slate-600 truncate">{job.company}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border flex-shrink-0 ml-2 ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </div>

                  {/* Card Details */}
                  <div className="flex items-center space-x-2 text-xs text-slate-500 mb-4">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Applied {job.dateApplied ? new Date(job.dateApplied).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'N/A'}
                    </span>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setAiAnalysisJob(job)}
                        className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                        title="AI Analysis"
                      >
                        <Brain className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditJob(job)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                        title="Edit Application"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id, job.title)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Application"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {job.applicationLink && (
                      <a
                        href={job.applicationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors text-sm"
                      >
                        <span>View</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/80 border-b border-slate-200">
                    <tr>
                      <th 
                        className="px-6 py-4 text-left text-sm font-semibold text-slate-900 cursor-pointer hover:bg-slate-100/50 transition-colors"
                        onClick={() => handleSort('title')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Position</span>
                          {sortBy === 'title' && (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-semibold text-slate-900 cursor-pointer hover:bg-slate-100/50 transition-colors"
                        onClick={() => handleSort('company')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Company</span>
                          {sortBy === 'company' && (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-semibold text-slate-900 cursor-pointer hover:bg-slate-100/50 transition-colors"
                        onClick={() => handleSort('dateApplied')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Applied</span>
                          {sortBy === 'dateApplied' && (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {paginatedJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{job.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-700">{job.company}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 text-slate-600">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span>
                              {job.dateApplied ? new Date(job.dateApplied).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              }) : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setAiAnalysisJob(job)}
                              className="text-purple-600 hover:text-purple-700 transition-colors"
                              title="AI Analysis"
                            >
                              <Brain className="h-4 w-4" />
                            </button>
                            {job.applicationLink && (
                              <a
                                href={job.applicationLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 transition-colors"
                                title="View Application"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                            <button
                              onClick={() => handleEditJob(job)}
                              className="text-slate-600 hover:text-slate-900 transition-colors"
                              title="Edit Application"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteJob(job.id, job.title)}
                              className="text-red-600 hover:text-red-700 transition-colors"
                              title="Delete Application"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Enhanced Responsive Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                <div className="text-xs sm:text-sm text-slate-600 text-center sm:text-left">
                  Showing {startIndex + 1} to {Math.min(startIndex + jobsPerPage, filteredJobs.length)} of {filteredJobs.length} applications
                </div>
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  {/* Mobile: Show fewer page numbers */}
                  {Array.from({ length: Math.min(window.innerWidth < 640 ? 3 : 5, totalPages) }, (_, i) => {
                    let page;
                    const maxPages = window.innerWidth < 640 ? 3 : 5;
                    if (totalPages <= maxPages) {
                      page = i + 1;
                    } else if (currentPage <= Math.floor(maxPages/2) + 1) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - Math.floor(maxPages/2)) {
                      page = totalPages - maxPages + 1 + i;
                    } else {
                      page = currentPage - Math.floor(maxPages/2) + i;
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Add Job Form Modal */}
        <AddJobForm
          isOpen={isAddFormOpen}
          onClose={handleCloseForm}
          onJobAdded={fetchJobs}
          editJob={editingJob}
        />

        {/* AI Analysis Modal */}
        {aiAnalysisJob && (
          <AIAnalysis
            job={aiAnalysisJob}
            isOpen={!!aiAnalysisJob}
            onClose={() => setAiAnalysisJob(null)}
          />
        )}
      </div>
    </div>
  );
}