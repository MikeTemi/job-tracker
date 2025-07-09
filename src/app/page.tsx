'use client';

import { useState, useEffect } from 'react';
import { Job } from '@/types/job';

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

if (loading) {
  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='text-lg'>Loading jobs...</div>
    </div>
  );
}

if (error) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-red-500">Error: {error}</div>
    </div>
  )
}

return (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className='text-3xl font-bold text-gray-900'>Job Tracker</h1>
        <p className='text-gray-600 mt-2'>Track your job applications and progress</p>
      </div>
      
      {/* Add Job Button */}
      <div className="mb-6">
        <button className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors'>+ Add New Job</button>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className='w-full'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Job Title</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Company</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Date Applied</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {jobs.map(job => (
              <tr key={job.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className="text-sm font-medium text-gray-900">{job.title}</div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className="text-sm text-gray-900">{job.company}</div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">{job.status}</span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {new Date(job.dateApplied).toLocaleDateString()}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                  <button className='text-blue-600 hover:text-blue-900 mr-4'>Edit</button>
                  <button className='text-red-600 hover:text-red-900'>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {jobs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">No jobs found. Add your first job application!</div>
        </div>
      )}
    </div>
  </div>
);
}