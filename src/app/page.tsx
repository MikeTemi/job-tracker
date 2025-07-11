'use client';

import { useState, useEffect } from 'react';
import { Job, JobStatus } from '@/types/job';
import AddJobForm from '@/components/AddJobForm';


// Status color mapping
const getStatusColor = (status: JobStatus) => {
  switch (status) {
    case JobStatus.APPLIED:
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case JobStatus.INTERVIEWING:
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case JobStatus.OFFER:
      return 'bg-green-50 text-green-700 border-green-200';
    case JobStatus.REJECTED:
      return 'bg-gray-50 text-gray-600 border-gray-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  // Fetch jobs from the API
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs');
      const data = await response.json();

      if (data.success) {
        setJobs(data.data);
      } else {
        setError(data.error || 'Failed to fetch jobs');
      }
    } catch (err) {
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
};

// Delete job function
const handleDeleteJob = async (jobId: string, jobTitle: string) => {
  const confirmed = window.confirm(
    `Are you sure you want to delee "${jobTitle}"?\n\n This action cannot be undone.`);

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        //Refresh the jobs list
        fetchJobs();
      } else {
        alert('Failed to delete job: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('An error occured while deleting the job');
    }
}

// Calculate statistics
const stats = {
  total: jobs.length,
  applied: jobs.filter(job => job.status === JobStatus.APPLIED).length,
  interviewing: jobs.filter(job => job.status === JobStatus.INTERVIEWING).length,
  offers: jobs.filter(job => job.status === JobStatus.OFFER).length,
  rejected: jobs.filter(job => job.status === JobStatus.REJECTED).length  
};

if (loading) {
  return (
    <div className='flex items-center justify-center min-h-screen bg-slate-50'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4'></div>
        <div className='text-lg text-slate-600'>Loading your applications...</div>
      </div>
    </div>
  );
}

if (error) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <div className="text-red-600 mb-2">⚠️ Something went wrong</div>
        <div className="text-slate-600">{error}</div>
      </div>
    </div>
  )
}

return (
  <div className="min-h-screen bg-slate-50">
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className='text-4xl font-bold text-slate-900 mb-2'>Job Application Tracker</h1>
        <p className='text-slate-600 text-lg'>Stay organized and land your dream job with confidence</p>
      </div>

      {/* Statistics Cards - AI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-sm text-slate-500">Total Applications</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="text-2xl font-bold text-blue-600">{stats.applied}</div>
          <div className="text-sm text-slate-500">Applied</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="text-2xl font-bold text-amber-600">{stats.interviewing}</div>
          <div className="text-sm text-slate-500">Interviewing</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="text-2xl font-bold text-green-600">{stats.offers}</div>
          <div className="text-sm text-slate-500">Offers</div>
        </div>
      </div>

      {/* Action header - AI*/}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Your Applications</h2>
        <button
         onClick={() => setIsAddFormOpen(true)}
         className='bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-sm'>
          + Add New Application
        </button>
      </div>
    
      {/* Jobs Table - AI */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className='w-full'>
            <thead className='bg-slate-50 border-b border-slate-200'>
              <tr>
                <th className='px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider'>Position</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider'>Company</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider'>Status</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider'>Applied</th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider'>Actions</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-slate-200'>
              {jobs.map((job) => (
                <tr key={job.id} className='hover:bg-slate-50 transition-colors'>
                  <td className='px-6 py-4'>
                    <div className="font-medium text-slate-900">{job.title}</div>
                  </td>
                  <td className='px-6 py-4'>
                    <div className="text-slate-700">{job.company}</div>
                  </td>
                  <td className='px-6 py-4'>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-slate-600'>
                    {new Date(job.dateApplied).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </td>
                  <td className='px-6 py-4'>
                    <div className="flex space-x-3">
                      <button className='text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors'>
                        Edit
                      </button>
                      <button 
                      onClick={() => handleDeleteJob(job.id, job.title)}
                      className='text-red-600 hover:text-red-700 text-sm font-medium transition-colors'>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State - Human-friendly messaging */}
        {jobs.length === 0 && (
          <div className="text-center py-16">
            <div className="text-slate-400 text-5xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Ready to start your job search?</h3>
            <p className="text-slate-600 mb-6">Add your first job application and take control of your career journey.</p>
            <button 
              onClick={() => setIsAddFormOpen(true)}
              className='bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors font-medium'>
              Add Your First Application
            </button>
          </div>
        )}

        
        {/* Add Job Form Modal */}
        <AddJobForm
          isOpen={isAddFormOpen}
          onClose={() => setIsAddFormOpen(false)}
          onJobAdded={fetchJobs}
        />
      </div>
    </div>
  );
}