import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { success } from 'zod/v4-mini';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { jobTitle, company, jobDescription, analysisType} = await request.json();

        let prompt = '';

        switch (analysisType) {
            case 'job-analysis':
                prompt = `Analyze this job posting and provide insights:
                
                Job Title: ${jobTitle}
                Company: ${company}
                Job Description: ${jobDescription}
                
                Please provide:
                1. Key rewuirements and skills needed
                2. Company culture insights
                3. Salary range estimate
                4. Application tips
                5. Interview preparation advice
                
                Keep the response concise and actionable.`;
                break;

            case 'application-status':
                prompt = `Based on this job application, suggest next steps:
                
                Job Title: ${jobTitle}
                Company: ${company}
                
                Provide specific advice on:
                1. Follow-up actions
                2. Networking opportunities
                3. Interview preparation focus areas
                4. Alternative similar roles to consider
                5. Additional skills to highlight
                
                Be practical and specific.`;
                break;

            case 'interview-preparation':
                prompt = `Help prepare for an interview at ${company} for the position of ${jobTitle}:

                Provide:
                1. 5 likely technical questions
                2. 5 behavourial questions specific to this role
                3. Questions to ask the interviewer
                4. Company-specific talking points
                5. Key achievements to highlight

                Make it role-specific and actionable.`;
                break;

            default:
                prompt = `Provide general advice for someone applying to ${jobTitle} positions at companies like ${company}.`;
    }

    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: "system", 
              content: "You are a professional career advisor and job application expert. Provide helpful, specific, and actionable advice."
            },
            { role: "user",
              content: prompt
            }
        ],
        max_completion_tokens: 800,
        temperature: 0.7,
    });

    const analysis = completion.choices[0]?.message?.content || 'No analysis available';

    return NextResponse.json({
        success: true,
        analysis,
        analysisType
    });

    } catch (error) {
        console.error('❌ OpenAI API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to analyze job'
            },
            { status: 500 }
        );
    }

}