import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { jobs, analysisType = 'overview' } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key not configured'
      });
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No jobs data provided'
      });
    }

    let prompt = '';
    
    switch (analysisType) {
      case 'overview':
        prompt = createOverviewPrompt(jobs);
        break;
      case 'patterns':
        prompt = createPatternsPrompt(jobs);
        break;
      case 'recommendations':
        prompt = createRecommendationsPrompt(jobs);
        break;
      case 'market':
        prompt = createMarketPrompt(jobs);
        break;
      default:
        prompt = createOverviewPrompt(jobs);
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // More cost-effective than GPT-4
      messages: [
        {
          role: "system",
          content: "You are an expert career advisor and data analyst specializing in job search optimization. Provide actionable, specific insights based on job application data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const analysis = completion.choices[0]?.message?.content || 'Unable to generate analysis';

    return NextResponse.json({
      success: true,
      analysis: analysis,
      tokensUsed: completion.usage?.total_tokens || 0
    });

  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate AI insights'
    });
  }
}

function createOverviewPrompt(jobs: any[]) {
  const jobSummary = jobs.map(job => ({
    title: job.title,
    company: job.company,
    status: job.status,
    dateApplied: job.dateApplied,
    location: job.location || 'Not specified'
  }));

  return `
Analyze this job application data and provide insights:

${JSON.stringify(jobSummary, null, 2)}

Please provide:
1. **Success Rate Analysis**: Calculate and interpret conversion rates
2. **Application Patterns**: Identify trends in timing, companies, roles
3. **Optimization Opportunities**: Specific areas for improvement
4. **Market Position**: Assessment of competitiveness

Keep insights actionable and specific. Use emojis for visual appeal.
  `;
}

function createPatternsPrompt(jobs: any[]) {
  return `
Analyze these job applications for patterns and trends:

${JSON.stringify(jobs.map(job => ({
  title: job.title,
  company: job.company,
  status: job.status,
  dateApplied: job.dateApplied,
  location: job.location
})), null, 2)}

Focus on:
1. **Industry/Role Patterns**: What types of positions are most successful?
2. **Timing Patterns**: Best days/times for applications
3. **Company Size/Type**: Which company types respond best?
4. **Geographic Patterns**: Location-based success rates
5. **Status Progression**: How quickly do applications move through stages?

Provide specific, actionable insights with concrete recommendations.
  `;
}

function createRecommendationsPrompt(jobs: any[]) {
  return `
Based on this job application history, provide strategic recommendations:

${JSON.stringify(jobs.map(job => ({
  title: job.title,
  company: job.company,
  status: job.status,
  dateApplied: job.dateApplied
})), null, 2)}

Provide recommendations for:
1. **Target Companies**: Similar companies to apply to
2. **Role Optimization**: Adjustments to job search criteria
3. **Application Strategy**: Timing, frequency, approach improvements
4. **Follow-up Strategy**: When and how to follow up
5. **Skill Development**: Skills to highlight or develop

Make recommendations specific and actionable with clear next steps.
  `;
}

function createMarketPrompt(jobs: any[]) {
  const industries = [...new Set(jobs.map(job => job.title))];
  const companies = [...new Set(jobs.map(job => job.company))];
  
  return `
Analyze market trends based on this job search data:

Industries/Roles: ${industries.join(', ')}
Companies: ${companies.join(', ')}
Application Timeline: ${jobs.length} applications over time

Provide insights on:
1. **Market Demand**: Current demand for these roles
2. **Competitive Landscape**: How competitive these positions are
3. **Salary Expectations**: Expected salary ranges for these roles
4. **Growth Opportunities**: Career progression paths
5. **Market Timing**: Best times to apply in this market

Focus on current 2024 job market trends and data.
  `;
}