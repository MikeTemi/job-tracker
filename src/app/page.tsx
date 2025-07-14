'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2, ExternalLink, Calendar, Building, User, Brain } from 'lucide-react';
import { Job, JobStatus } from '@/types/job';
import AddJobForm from '@/components/AddJobForm';
import JobCharts from '@/components/JobCharts';
import AIAnalysis from '@/components/AIAnalysis';

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [aiAnalysisJob, setAiAnalysisJob] = useState<Job | null>(null);
  
  // New state for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;

  useEffect(() => {
    fetchJobs();
  }, []);

  // Filter jobs based on search and status
  useEffect(() => {
    let filtered = jobs || [];

    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [jobs, searchTerm, statusFilter]);

const fetchJobs = async () => {
  try {
    console.log('🔄 Fetching jobs...');
    setLoading(true);
    const response = await fetch('/api/jobs');
    console.log('📡 Response status:', response.status);
    const data = await response.json();
    console.log('📦 Response data:', data);
    
    if (data.success) {
      console.log('✅ Jobs loaded:', data.jobs.length, 'jobs');
      setJobs(data.jobs);
      setError(null);
    } else {
      console.log('❌ API error:', data.error);
      setError(data.error || 'Failed to fetch jobs');
    }
  } catch (err) {
    console.log('💥 Fetch error:', err);
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

  const stats = {
  total: jobs?.length || 0,
  applied: jobs?.filter(job => job.status === JobStatus.APPLIED).length || 0,
  interviewing: jobs?.filter(job => job.status === JobStatus.INTERVIEWING).length || 0,
  offers: jobs?.filter(job => job.status === JobStatus.OFFER).length || 0,
  rejected: jobs?.filter(job => job.status === JobStatus.REJECTED).length || 0,
  };

  // Pagination
  const totalPages = Math.ceil((filteredJobs?.length || 0) / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const paginatedJobs = filteredJobs?.slice(startIndex, startIndex + jobsPerPage) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchJobs}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Job Applications
              </h1>
              <p className="text-slate-600 mt-1">Track and manage your job applications</p>
            </div>
            <button
              onClick={() => setIsAddFormOpen(true)}
              className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 group"
            >
              <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
              <span>Add New Application</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200">
            <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-sm text-slate-600 flex items-center mt-1">
              <User className="h-4 w-4 mr-1" />
              Total
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200">
            <div className="text-3xl font-bold text-blue-600">{stats.applied}</div>
            <div className="text-sm text-slate-600 flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              Applied
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200">
            <div className="text-3xl font-bold text-amber-600">{stats.interviewing}</div>
            <div className="text-sm text-slate-600 flex items-center mt-1">
              <User className="h-4 w-4 mr-1" />
              Interviewing
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200">
            <div className="text-3xl font-bold text-green-600">{stats.offers}</div>
            <div className="text-sm text-slate-600 flex items-center mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              Offers
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200">
            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-slate-600 flex items-center mt-1">
              <User className="h-4 w-4 mr-1" />
              Rejected
            </div>
          </div>
        </div>

        {/* Beautiful Charts */}
        <JobCharts jobs={jobs} />

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by job title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-gray-900"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors appearance-none bg-white text-gray-900"
              >
                <option value="all">All Statuses</option>
                <option value={JobStatus.APPLIED}>Applied</option>
                <option value={JobStatus.INTERVIEWING}>Interviewing</option>
                <option value={JobStatus.OFFER}>Offer</option>
                <option value={JobStatus.REJECTED}>Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Jobs Table */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
            <div className="bg-slate-100 rounded-full p-4 w-20 h-20 mx-auto mb-4">
              <Building className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No applications found' : 'No applications yet'}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Start tracking your job applications by adding your first one'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => setIsAddFormOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Add Your First Application
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/80 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Position</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Company</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Applied</th>
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
                          <div className="text-slate-700">{job.company}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {job.dateApplied ? new Date(job.dateApplied).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) : 'N/A'}
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
                            <a
                              href={job.applicationLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 transition-colors"
                              title="View Application"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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