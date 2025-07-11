'use client';

import { useEffect, useState } from 'react';
import { JobStatus, Job } from '@/types/job';

interface AddJobFormProps {
  isOpen: boolean;
  onClose: () => void;
  onJobAdded: () => void;
  editJob?: Job | null;
}

export default function AddJobForm({ isOpen, onClose, onJobAdded, editJob }: AddJobFormProps) {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [applicationLink, setApplicationLink] = useState('');
  const [status, setStatus] = useState<JobStatus>(JobStatus.APPLIED);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Determine if we're in edit mode
  const isEditMode = !!editJob;

  // Pre-populate form when editing
  useEffect(() => {
    if (editJob) {
      setTitle(editJob.title);
      setCompany(editJob.company);
      setApplicationLink(editJob.applicationLink);
      setStatus(editJob.status);
    } else {
      //Reset form when adding new job
      setTitle('');
      setCompany('');
      setApplicationLink('');
      setStatus(JobStatus.APPLIED);
    }
    setError('');
  }, [editJob]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !company || !applicationLink) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // Choose API endpoint and method based on mode
      const url = isEditMode ? `/api/jobs/${editJob.id}` : '/api/jobs';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          company,
          applicationLink,
          status,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Reset form
        setTitle('');
        setCompany('');
        setApplicationLink('');
        setStatus(JobStatus.APPLIED);
        
        // Refresh jobs and close modal
        onJobAdded();
        onClose();
      } else {
        setError(data.error || `Failed to ${isEditMode ? 'update' : 'add'} job`);
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setTitle('');
    setCompany('');
    setApplicationLink('');
    setStatus(JobStatus.APPLIED);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? 'Edit Job Application' : 'Add New Job'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Software Engineer Intern"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="UseAppEasy"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Link
            </label>
            <input
              type="url"
              value={applicationLink}
              onChange={(e) => setApplicationLink(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="https://company.com/jobs/123"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as JobStatus)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value={JobStatus.APPLIED}>Applied</option>
              <option value={JobStatus.INTERVIEWING}>Interviewing</option>
              <option value={JobStatus.OFFER}>Offer</option>
              <option value={JobStatus.REJECTED}>Rejected</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting
               ? (isEditMode ? 'Updating...' : 'Adding...')
               : (isEditMode ? 'Update Job' : 'Add Job')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

