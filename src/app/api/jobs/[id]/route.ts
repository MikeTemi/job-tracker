import { NextRequest, NextResponse } from "next/server";
import { getJobById, updateJob, deleteJob } from "@/lib/data-store";
import { JobStatus, UpdateJobData } from "@/types/job";

//GET /api/jobs/:id - Get specific job by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const job = getJobById(params.id);

        if (!job) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Job not found"
                }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: job
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: "Failed to fetch job"
        }, { status: 500 });
    }
}

//PUT /api/jobs/:id - Update specific job by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const { title, company, applicationLink, status } = body;

        //Check if job exists
        const existingJob = getJobById(params.id);
        if (!existingJob) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Job not found"
                }, { status: 404 });
        }

        //Validate status if provided
        if (status && !Object.values(JobStatus).includes(status)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid job status: Must be one of: ' + Object.values(JobStatus).join(', ')
            }, { status: 400 });
        }

        //Prepare update data (only include fields that are provided)
        const updateData: Partial<UpdateJobData> = {};
        if (title) updateData.title = title.trim();
        if (company) updateData.company = company.trim();
        if (applicationLink) updateData.applicationLink = applicationLink.trim();
        if (status) updateData.status = status;

        const updatedJob = updateJob(params.id, updateData);

        return NextResponse.json({
            success: true,
            data: updatedJob
        });
    }catch (error) {
        return NextResponse.json({
            success: false,
            error: "Failed to update job"
        }, { status: 500 });
    }
}

//DELETE /api/jobs/:id - Delete specific job by ID
export async function DELETE(request:NextRequest, { params }: { params: { id: string }}) {
    try {
        const success = deleteJob(params.id);

        if (!success) {
            return NextResponse.json({
                success: false,
                error: "Job not found"
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Job deleted successfully"
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: "Failed to delete job"
        }, { status: 500 });
    }
}