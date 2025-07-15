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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Welcome back! 👋
              </h1>
              <p className="text-slate-600 mt-2">
                Here's your job search progress at a glance
              </p>
            </div>
            <button
              onClick={() => setIsAddFormOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 group"
            >
              <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
              <span>Quick Add</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Applications</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{totalJobs}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">Active search</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Response</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{appliedJobs}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-sm text-slate-500">Awaiting feedback</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">In Process</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{interviewingJobs}</p>
              </div>
              <div className="bg-amber-100 rounded-full p-3">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-sm text-slate-500">Active interviews</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Response Rate</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{responseRate}%</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-sm text-slate-500">Success metric</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          <JobCharts jobs={jobs} />
        </div>

        {/* Recent Applications */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Recent Applications</h2>
            <Link 
              href="/applications"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors group"
            >
              <span className="text-sm font-medium">View all</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {recentJobs.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No applications yet</h3>
              <p className="text-slate-600 mb-6">Start tracking your job applications to see them here</p>
              <button
                onClick={() => setIsAddFormOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Add Your First Application
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors group">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Building className="h-5 w-5 text-slate-400" />
                      <div>
                        <h3 className="font-semibold text-slate-900">{job.title}</h3>
                        <p className="text-sm text-slate-600">{job.company}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                    
                    <div className="text-sm text-slate-500">
                      {new Date(job.dateApplied).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    
                    {job.applicationLink && (
                      <a
                        href={job.applicationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-700 transition-all"
                      >
                        <ExternalLink className="h-4 w-4" />
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