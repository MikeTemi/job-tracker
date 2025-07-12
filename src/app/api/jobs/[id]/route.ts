import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Job, JobStatus } from '@/types/job';

const jobsFilePath = path.join(process.cwd(), 'jobs.json');

// Helper function to read jobs
async function readJobs() {
  try {
    const fileContent = await fs.readFile(jobsFilePath, 'utf8');
    const data = JSON.parse(fileContent);
    return data.jobs || [];
  } catch (error) {
    console.error('Error reading jobs file:', error);
    return [];
  }
}

// Helper function to write jobs
async function writeJobs(jobs: Job[]) {
  try {
    const data = { jobs };
    await fs.writeFile(jobsFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing jobs file:', error);
    throw error;
  }
}

//GET /api/jobs/:id - Get specific job by ID
// GET /api/jobs/[id] - Get specific job by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const jobs = await readJobs();
        const job = jobs.find((job: Job) => job.id === params.id);

        if (!job) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Job not found"
                }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            job: job
        });
    } catch (error) {
        console.error('❌ GET /api/jobs/[id] error:', error);
        return NextResponse.json({
            success: false,
            error: "Failed to fetch job"
        }, { status: 500 });
    }
}
// PUT /api/jobs/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    const body = await request.json();
    const { title, company, applicationLink, status } = body;

    // Validation
    if (!title || !company || !applicationLink || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const jobs = await readJobs();
    const jobIndex = jobs.findIndex((job: Job) => job.id === jobId);

    if (jobIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Update the job
    jobs[jobIndex] = {
      ...jobs[jobIndex],
      title,
      company,
      applicationLink,
      status: status as JobStatus
    };

    await writeJobs(jobs);

    console.log('✅ Updated job:', jobs[jobIndex].title);

    return NextResponse.json({
      success: true,
      job: jobs[jobIndex]
    });
  } catch (error) {
    console.error('❌ PUT /api/jobs/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update job' },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    const jobs = await readJobs();
    const jobIndex = jobs.findIndex((job: Job) => job.id === jobId);

    if (jobIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    const deletedJob = jobs[jobIndex];
    jobs.splice(jobIndex, 1);
    await writeJobs(jobs);

    console.log('🗑️ Deleted job:', deletedJob.title);

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('❌ DELETE /api/jobs/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete job' },
      { status: 500 }
    );
  }
}