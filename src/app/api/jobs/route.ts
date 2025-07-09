import { NextRequest, NextResponse } from "next/server";
import { getAllJobs, createJob } from "@/lib/data-store";
import { CreateJobData, JobStatus } from "@/types/job";

//GET /api/jobs - Get all jobs
export async function GET() {
    try {
        const jobs = getAllJobs();
        return NextResponse.json({
            success: true,
            data: jobs
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: "Failed to fetch jobs"
        }, { status: 500 });
    }
}

//POST /api/jobs - Create a new job
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        //Validate required fields
        const { title, company, applicationLink, status } = body;

        if (!title || !company || !applicationLink || !status) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields: title, company, applicationLink, status'
            }, { status: 400 });
        }

        //Validate status enum
        if (!Object.values(JobStatus).includes(status)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid job status'
            }, { status: 400 });
        }

        //Create job data
        const jobData: CreateJobData = {
            title: title.trim(),
            company: company.trim(),
            applicationLink: applicationLink.trim(),
            status
        };

        const newJob = createJob(jobData);

        return NextResponse.json({
            success: true,
            data: newJob
            }, { status: 201 });
        } catch (error) {
            return NextResponse.json({
                success: false,
                error: "Failed to create job"
            }, { status: 500 });
            
    }
}