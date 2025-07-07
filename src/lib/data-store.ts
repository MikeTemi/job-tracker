import { v4 as uuidv4 } from 'uuid';
import { Job, JobStatus, CreateJobData, UpdateJobData } from '@/types/job';

// In-memory storage for job applications
let jobs: Job[] = [
  {
    id: uuidv4(),
    title: 'Frontend Developer Intern',
    company: 'TechCorp',
    applicationLink: 'https://techcorp.com/careers/frontend-intern',
    status: JobStatus.APPLIED,
    dateApplied: new Date('2025-01-15'),
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15')
  },
  {
    id: uuidv4(),
    title: 'Software Engineer Intern',
    company: 'StartupXYZ',
    applicationLink: 'https://startupxyz.com/jobs/swe-intern',
    status: JobStatus.INTERVIEWING,
    dateApplied: new Date('2025-01-20'),
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-01-22')
  },
  {
    id: uuidv4(),
    title: 'Full Stack Developer',
    company: 'InnovateLabs',
    applicationLink: 'https://innovatelabs.io/careers',
    status: JobStatus.OFFER,
    dateApplied: new Date('2025-01-25'),
    createdAt: new Date('2025-01-25'),
    updatedAt: new Date('2025-01-30')
  },
  {
    id: uuidv4(),
    title: 'Backend Developer',
    company: 'DataSystems Inc',
    applicationLink: 'https://datasystems.com/apply',
    status: JobStatus.REJECTED,
    dateApplied: new Date('2025-01-10'),
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-18')
  }
];

// Get all jobs
export function getAllJobs(): Job[] {
  return [...jobs].sort((a, b) => b.dateApplied.getTime() - a.dateApplied.getTime());
}

// Get job by ID
export function getJobById(id: string): Job | null {
  return jobs.find(job => job.id === id) || null;
}

// Create new job
export function createJob(data: CreateJobData): Job {
  const now = new Date();
  const newJob: Job = {
    id: uuidv4(),
    ...data,
    dateApplied: now,
    createdAt: now,
    updatedAt: now
  };
  
  jobs.push(newJob);
  return newJob;
}

// Update existing job
export function updateJob(id: string, data: Partial<UpdateJobData>): Job | null {
  const jobIndex = jobs.findIndex(job => job.id === id);
  
  if (jobIndex === -1) {
    return null;
  }
  
  const updatedJob: Job = {
    ...jobs[jobIndex],
    ...data,
    updatedAt: new Date()
  };
  
  jobs[jobIndex] = updatedJob;
  return updatedJob;
}

// Delete job
export function deleteJob(id: string): boolean {
  const initialLength = jobs.length;
  jobs = jobs.filter(job => job.id !== id);
  return jobs.length < initialLength;
}

// Get jobs by status
export function getJobsByStatus(status: JobStatus): Job[] {
  return jobs.filter(job => job.status === status);
}

// Search jobs by title or company
export function searchJobs(searchTerm: string): Job[] {
  const term = searchTerm.toLowerCase();
  return jobs.filter(job => 
    job.title.toLowerCase().includes(term) || 
    job.company.toLowerCase().includes(term)
  );
}

// Get job statistics
export function getJobStats() {
  return {
    total: jobs.length,
    applied: jobs.filter(job => job.status === JobStatus.APPLIED).length,
    interviewing: jobs.filter(job => job.status === JobStatus.INTERVIEWING).length,
    offers: jobs.filter(job => job.status === JobStatus.OFFER).length,
    rejected: jobs.filter(job => job.status === JobStatus.REJECTED).length
  };
}