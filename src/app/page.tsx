'use client';

import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Calendar, Building, Users, ArrowRight, ExternalLink } from 'lucide-react';
import { Job, JobStatus } from '@/types/job';
import AddJobForm from '@/components/AddJobForm';
import JobCharts from '@/components/JobCharts';
import Link from 'next/link';

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

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

  const handleCloseForm = () => {
    setIsAddFormOpen(false);
    setEditingJob(null);
  };

  // Calculate stats
  const totalJobs = jobs.length;
  const appliedJobs = jobs.filter(job => job.status === JobStatus.APPLIED).length;
  const interviewingJobs = jobs.filter(job => job.status === JobStatus.INTERVIEWING).length;
  const offerJobs = jobs.filter(job => job.status === JobStatus.OFFER).length;
  const rejectedJobs = jobs.filter(job => job.status === JobStatus.REJECTED).length;

  // Recent applications (last 5)
  const recentJobs = jobs
    .sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime())
    .slice(0, 5);

  // Response rate
  const responseRate = totalJobs > 0 ? Math.round(((interviewingJobs + offerJobs) / totalJobs) * 100) : 0;

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.APPLIED:
        return 'bg-blue-100 text-blue-800';
      case JobStatus.INTERVIEWING:
        return 'bg-amber-100 text-amber-800';
      case JobStatus.OFFER:
        return 'bg-green-100 text-green-800';
      case JobStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 text-sm sm:text-base">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
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
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Welcome Header - Responsive */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Welcome back! 👋
              </h1>
              <p className="text-slate-600 mt-2 text-sm sm:text-base">
                Here's your job search progress at a glance
              </p>
            </div>
            <button
              onClick={() => setIsAddFormOpen(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group"
            >
              <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
              <span>Quick Add</span>
            </button>
          </div>
        </div>

        {/* Stats Grid - Mobile-First Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          
          {/* Total Applications Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Total Applications</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{totalJobs}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-2 sm:p-3 flex-shrink-0">
                <Building className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-3 sm:mt-4">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-1" />
              <span className="text-xs sm:text-sm text-green-600">Active search</span>
            </div>
          </div>

          {/* Pending Response Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Pending Response</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1">{appliedJobs}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-2 sm:p-3 flex-shrink-0">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-3 sm:mt-4">
              <span className="text-xs sm:text-sm text-slate-500">Awaiting feedback</span>
            </div>
          </div>

          {/* In Process Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">In Process</p>
                <p className="text-2xl sm:text-3xl font-bold text-amber-600 mt-1">{interviewingJobs}</p>
              </div>
              <div className="bg-amber-100 rounded-full p-2 sm:p-3 flex-shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
            </div>
            <div className="flex items-center mt-3 sm:mt-4">
              <span className="text-xs sm:text-sm text-slate-500">Active interviews</span>
            </div>
          </div>

          {/* Response Rate Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Response Rate</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">{responseRate}%</p>
              </div>
              <div className="bg-green-100 rounded-full p-2 sm:p-3 flex-shrink-0">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-3 sm:mt-4">
              <span className="text-xs sm:text-sm text-slate-500">Success metric</span>
            </div>
          </div>
        </div>

        {/* Charts Section - Responsive */}
        <div className="mb-6 sm:mb-8">
          <JobCharts jobs={jobs} />
        </div>

        {/* Recent Applications - Mobile-Optimized */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Recent Applications</h2>
            <Link 
              href="/applications"
              className="flex items-center justify-center sm:justify-start space-x-2 text-blue-600 hover:text-blue-700 transition-colors group w-full sm:w-auto"
            >
              <span className="text-sm font-medium">View all</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {recentJobs.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Building className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No applications yet</h3>
              <p className="text-slate-600 mb-6 text-sm sm:text-base px-4">Start tracking your job applications to see them here</p>
              <button
                onClick={() => setIsAddFormOpen(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Add Your First Application
              </button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors group space-y-3 sm:space-y-0">
                  
                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <Building className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate">{job.title}</h3>
                        <p className="text-xs sm:text-sm text-slate-600 truncate">{job.company}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status and Actions */}
                  <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                      
                      <div className="text-xs sm:text-sm text-slate-500">
                        {new Date(job.dateApplied).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    
                    {job.applicationLink && (
                      <a
                        href={job.applicationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-blue-600 hover:text-blue-700 transition-all flex-shrink-0 p-1"
                        title="View job posting"
                      >
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Job Form Modal */}
        <AddJobForm
          isOpen={isAddFormOpen}
          onClose={handleCloseForm}
          onJobAdded={fetchJobs}
          editJob={editingJob}
        />
      </div>
    </div>
  );
}