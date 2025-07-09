'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { JobStatus } from "@/types/job";

//Zod validation schema
const addJobSchema = z.object({
    title: z.string().min(1, "Job title is required").max(100, "Job title must be less than 100 characters"),
    company: z.string().min(1, "Company name is required").max(50, "Company name must be less than 50 characters"),
    applicationLink: z.string().url("Please enter a valid URL").min(1, "Application link is required"),
    status: z.nativeEnum(JobStatus, {errorMap: () => ({
        message: "Please select a valid job status"
    })})
})

type AddJobFormData = z.infer<typeof addJobSchema>;

interface AddJobFormProps {
    isOpen: boolean;
    onClose: () => void;
    onJobAdded: () => void;
}

export default function AddJobForm({ isOpen, onClose, onJobAdded }: AddJobFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<AddJobFormData>({
        resolver: zodResolver(addJobSchema)
    })

    const onSubmit = async (data: AddJobFormData) => {
        try{
            setIsSubmitting(true);
            setSubmitError(null);

            const response = await fetch('/api/jobs', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                }, 
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                reset();
                onJobAdded();
                onClose();
            } else {
                setSubmitError(result.error || "Failed to add job");
            }
        } catch (error) {
            setSubmitError("An error occurred while adding the job");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        reset();
        setSubmitError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div 
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={handleClose}
                    />

                {/* Modal panel */}
                <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-900">Add New Job Application</h3>
                        <button
                            onClick={handleClose}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>  
                        </button>
                    </div>

                    {/* Error message */}
                    {submitError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{submitError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Job Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                                Job Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                {...register('title')}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                placeholder="e.g., Software Engineer Intern"
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                            )}
                        </div>

                        {/* Company Name */}
                        <div>
                            <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-1">
                                Company Name
                            </label>
                            <input
                                type="text"
                                id="company"
                                {...register('company')}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                placeholder="e.g, UseAppEasy"
                            />
                            {errors.company && (
                                <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
                            )}
                        </div>

                        {/* Application Link */}
                        <div>
                            <label htmlFor="applicationLink" className="block text-sm font-medium text-slate-700 mb-1">
                                Application Link
                            </label>
                            <input
                                type="url"
                                id="applicationLink"
                                {...register('applicationLink')}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                placeholder="https://company.com/careers/job-id"
                            />
                            {errors.applicationLink && (
                                <p className="mt-1 text-sm text-red-600">{errors.applicationLink.message}</p>
                            )}
                        </div>

                        {/* Status */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
                                Status
                            </label>
                            <select
                                id="status"
                                {...register('status')}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            >
                                <option value="">Select Status</option>
                                <option value={JobStatus.APPLIED}>Applied</option>
                                <option value={JobStatus.INTERVIEWING}>Interviewing</option>
                                <option value={JobStatus.OFFER}>Offer</option>
                                <option value={JobStatus.REJECTED}>Rejected</option>
                            </select>
                            {errors.status && (
                                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                            )}
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Adding..." : "Add Job"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

