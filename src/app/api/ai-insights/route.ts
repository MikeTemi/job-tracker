import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Generate prompt that users can copy to any AI service
function generateCopyablePrompt(jobs: any[], analysisType: string = 'comprehensive') {
  const jobSummary = jobs.map(job => ({
    title: job.title,
    company: job.company,
    status: job.status,
    dateApplied: job.dateApplied,
    location: job.location || 'Not specified'
  }));

  // Different prompts based on analysis type
  let specificPrompt = '';
  
  if (analysisType === 'job-analysis') {
    specificPrompt = `
**Focus specifically on JOB ANALYSIS for this role:**
- Analyze the job title and company fit
- Assess market demand for this role
- Evaluate career growth potential
- Compare salary expectations vs market rate
- Identify key skills/requirements for success
    `;
  } else if (analysisType === 'application-status') {
    specificPrompt = `
**Focus specifically on APPLICATION STATUS & NEXT STEPS:**
- Analyze current application status and timeline
- Recommend specific follow-up actions
- Suggest optimal timing for follow-ups
- Provide interview preparation if applicable
- Identify potential concerns or red flags
    `;
  } else if (analysisType === 'interview-preparation') {
    specificPrompt = `
**Focus specifically on INTERVIEW PREPARATION:**
- Research the company culture and values
- Predict likely interview questions for this role
- Suggest specific examples/stories to prepare
- Recommend questions to ask the interviewer
- Provide salary negotiation strategies
    `;
  } else {
    specificPrompt = `
**Provide COMPREHENSIVE ANALYSIS covering:**
- Overall application strategy assessment
- Success rate and conversion analysis
- Pattern recognition and optimization opportunities
- Strategic recommendations for improvement
    `;
  }

  return `Act as an expert career advisor and data analyst specializing in job search optimization.

${jobs.length === 1 ? 
  `Analyze this specific job application:` : 
  `Analyze these ${jobs.length} job applications:`
}

${JSON.stringify(jobSummary, null, 2)}

${specificPrompt}

**📊 PERFORMANCE ANALYSIS**
- Current status assessment and timeline evaluation
- Market positioning and competitive analysis
- Success probability and optimization opportunities

**💡 STRATEGIC RECOMMENDATIONS**  
- Specific, actionable next steps
- Timeline for implementation
- Key success metrics to track

**🚀 IMMEDIATE ACTION ITEMS**
- 3-5 concrete tasks to complete this week
- Follow-up strategy and timing
- Application optimization suggestions

Keep the tone professional but encouraging. Use emojis for visual appeal and structure. Be specific and actionable with all recommendations. ${jobs.length === 1 ? 'Focus on this single application.' : 'Focus on patterns across applications.'}`;
}

export async function POST(request: Request) {
  try {
    const { jobs, analysisType = 'comprehensive' } = await request.json();

    console.log('API received:', { jobCount: jobs?.length, analysisType });

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No jobs data provided'
      });
    }

    // Generate the copyable prompt with analysis type
    const copyablePrompt = generateCopyablePrompt(jobs, analysisType);

    // Try OpenAI only if API key exists - DON'T initialize at build time
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('Attempting OpenAI request for analysis type:', analysisType);

        // Initialize OpenAI client here, not at module level
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an expert career advisor specializing in job search optimization. Provide actionable, encouraging insights based on application data."
            },
            {
              role: "user",
              content: copyablePrompt
            }
          ],
          max_tokens: 1200,
          temperature: 0.7,
        });

        const analysis = completion.choices[0]?.message?.content || 'Unable to generate analysis';

        console.log('OpenAI success, returning analysis');

        return NextResponse.json({
          success: true,
          analysis: analysis,
          tokensUsed: completion.usage?.total_tokens || 0,
          mode: 'ai',
          copyablePrompt: copyablePrompt
        });

      } catch (openaiError: any) {
        console.error('OpenAI API error:', openaiError);
        
        // Return prompt for manual use when OpenAI fails
        return NextResponse.json({
          success: true,
          mode: 'prompt',
          copyablePrompt: copyablePrompt,
          error: `OpenAI unavailable (${openaiError.code || 'quota exceeded'}). Use the prompt below with any AI service.`,
          suggestions: [
            'Copy the prompt to ChatGPT (chat.openai.com)',
            'Try Claude (claude.ai)',
            'Use Google Bard (bard.google.com)',
            'Or any other AI assistant'
          ]
        });
      }
    } else {
      console.log('No OpenAI API key, returning prompt mode');
      // No API key configured
      return NextResponse.json({
        success: true,
        mode: 'prompt',
        copyablePrompt: copyablePrompt,
        message: 'No OpenAI API key configured. Use the prompt below with any AI service.'
      });
    }

  } catch (error: any) {
    console.error('General API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate insights'
    });
  }
}