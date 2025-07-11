'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, Briefcase, Building, Link, CheckCircle } from 'lucide-react';
import { JobStatus, Job } from '@/types/job';

// Professional Zod validation schema
const jobSchema = z.object({
  title: z.string()
    .min(1, 'Job title is required')
    .max(100, 'Job title must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-\.]+$/, 'Job title contains invalid characters'),
  company: z.string()
    .min(1, 'Company name is required')
    .max(50, 'Company name must be less than 50 characters'),
  applicationLink: z.string()
    .url('Please enter a valid URL')
    .min(1, 'Application link is required'),
  status: z.nativeEnum(JobStatus)
});

type JobFormData = z.infer<typeof jobSchema>;

interface AddJobFormProps {
  isOpen: boolean;
  onClose: () => void;
  onJobAdded: () => void;
  editJob?: Job | null;
}

export default function AddJobForm({ isOpen, onClose, onJobAdded, editJob }: AddJobFormProps) {
  const isEditMode = !!editJob;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      company: '',
      applicationLink: '',
      status: JobStatus.APPLIED
    }
  });

  // Pre-populate form when editing
  useEffect(() => {
    if (editJob) {
      setValue('title', editJob.title);
      setValue('company', editJob.company);
      setValue('applicationLink', editJob.applicationLink);
      setValue('status', editJob.status);
    } else {
      reset();
    }
  }, [editJob, setValue, reset]);

  const onSubmit = async (data: JobFormData) => {
    try {
      const url = isEditMode ? `/api/jobs/${editJob.id}` : '/api/jobs';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        reset();
        onJobAdded();
        onClose();
      } else {
        throw new Error(result.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative inline-block transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-white/20 p-2">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {isEditMode ? 'Edit Application' : 'New Application'}
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="rounded-lg p-1 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-6">
            {/* Job Title */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Briefcase className="h-4 w-4 text-gray-500" />
                <span>Job Title</span>
              </label>
              <input
                {...register('title')}
                type="text"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                placeholder="e.g., Senior Frontend Developer"
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Company */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Building className="h-4 w-4 text-gray-500" />
                <span>Company</span>
              </label>
              <input
                {...register('company')}
                type="text"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                placeholder="e.g., UseAppEasy"
              />
              {errors.company && (
                <p className="text-sm text-red-600">{errors.company.message}</p>
              )}
            </div>

            {/* Application Link */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Link className="h-4 w-4 text-gray-500" />
                <span>Application Link</span>
              </label>
              <input
                {...register('applicationLink')}
                type="url"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                placeholder="https://company.com/careers/job-id"
              />
              {errors.applicationLink && (
                <p className="text-sm text-red-600">{errors.applicationLink.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <CheckCircle className="h-4 w-4 text-gray-500" />
                <span>Status</span>
              </label>
              <select
                {...register('status')}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
              >
                <option value={JobStatus.APPLIED}>Applied</option>
                <option value={JobStatus.INTERVIEWING}>Interviewing</option>
                <option value={JobStatus.OFFER}>Offer</option>
                <option value={JobStatus.REJECTED}>Rejected</option>
              </select>
              {errors.status && (
                <p className="text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-medium text-white hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{isEditMode ? 'Updating...' : 'Adding...'}</span>
                  </div>
                ) : (
                  <span>{isEditMode ? 'Update Application' : 'Add Application'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

