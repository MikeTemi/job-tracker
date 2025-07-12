import { NextRequest, NextResponse } from 'next/server';
import { getAllJobs, createJob } from '@/lib/data-store';
import { JobStatus } from '@/types/job';

// GET /api/jobs
export async function GET() {
  try {
    const jobs = getAllJobs();
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

    const newJob = createJob({
      title,
      company,
      applicationLink,
      status: status as JobStatus
    });

    console.log('✅ Added new job:', newJob.title);

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