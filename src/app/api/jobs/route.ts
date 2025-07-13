import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Job, JobStatus } from '@/types/job';

const jobsFilePath = path.join(process.cwd(), 'jobs.json');

// Helper function to read jobs from JSON file
async function readJobs(): Promise<Job[]> {
  try {
    const fileContent = await fs.readFile(jobsFilePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    // Convert string dates back to Date objects
    const jobs = (data.jobs || []).map((job: any) => ({
      ...job,
      dateApplied: job.dateApplied ? new Date(job.dateApplied) : new Date()
    }));
    
    return jobs;
  } catch (error) {
    console.error('Error reading jobs file:', error);
    await writeJobs([]);
    return [];
  }
}

// Helper function to write jobs to JSON file
async function writeJobs(jobs: Job[]): Promise<void> {
  try {
    // Convert Date objects to ISO strings for JSON storage
    const jobsForStorage = jobs.map(job => ({
      ...job,
      dateApplied: job.dateApplied instanceof Date ? job.dateApplied.toISOString() : job.dateApplied
    }));
    
    const data = { jobs: jobsForStorage };
    await fs.writeFile(jobsFilePath, JSON.stringify(data, null, 2));
    console.log('✅ Successfully wrote', jobs.length, 'jobs to file');
  } catch (error) {
    console.error('Error writing jobs file:', error);
    throw error;
  }
}

// GET /api/jobs
export async function GET() {
  try {
    console.log('🔍 Reading jobs from:', jobsFilePath);
    const jobs = await readJobs();
    console.log('📊 Found jobs:', jobs.length);
    
    return NextResponse.json({
      success: true,
      jobs
    });
  } catch (error) {
    console.error('❌ GET /api/jobs error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

// POST /api/jobs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, company, applicationLink, status } = body;

    // Validation
    if (!title || !company || !applicationLink || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Read existing jobs
    const jobs = await readJobs();
    
    // Create new job
    const newJob: Job = {
      id: Date.now().toString(),
      title,
      company,
      applicationLink,
      status: status as JobStatus,
      dateApplied: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add to jobs array
    jobs.push(newJob);
    
    // Write back to file
    await writeJobs(jobs);

    console.log('✅ Added new job:', newJob.title, 'Total jobs:', jobs.length);

    return NextResponse.json({
      success: true,
      job: newJob
    });
  } catch (error) {
    console.error('❌ POST /api/jobs error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create job' },
      { status: 500 }
    );
  }
}