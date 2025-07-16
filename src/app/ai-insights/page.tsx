'use client';

import { useState, useEffect } from 'react';
import { Brain, Sparkles, Loader2, AlertCircle, Check, Building, Calendar } from 'lucide-react';
import { Job, JobStatus } from '@/types/job';

export default function AIInsightsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSelection, setShowSelection] = useState(false);
  const [copyablePrompt, setCopyablePrompt] = useState<string>('');
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs');
      const data = await response.json();
      
      if (data.success) {
        const jobsWithDates = data.jobs.map((job: any) => ({
          ...job,
          dateApplied: job.dateApplied ? new Date(job.dateApplied) : new Date(),
          createdAt: job.createdAt ? new Date(job.createdAt) : new Date(),
          updatedAt: job.updatedAt ? new Date(job.updatedAt) : new Date()
        }));
        setJobs(jobsWithDates);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch jobs');
      }
    } catch (err) {
      setError('An error occurred while fetching jobs');
    } finally {
      setLoading(false);
    }
  };

  const toggleJobSelection = (jobId: string) => {
    const newSelected = new Set(selectedJobs);
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId);
    } else {
      newSelected.add(jobId);
    }
    setSelectedJobs(newSelected);
  };

  const selectAllJobs = () => {
    if (selectedJobs.size === jobs.length) {
      setSelectedJobs(new Set());
    } else {
      setSelectedJobs(new Set(jobs.map(job => job.id)));
    }
  };

  const generateInsight = async () => {
    const jobsToAnalyze = jobs.filter(job => selectedJobs.has(job.id));
    
    if (jobsToAnalyze.length === 0) {
      setError('Please select at least one application to analyze');
      return;
    }

    setGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobs: jobsToAnalyze,
          analysisType: 'comprehensive'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        if (data.mode === 'ai') {
          setInsight(data.analysis);
          setShowSelection(false);
          setShowPrompt(false);
        } else if (data.mode === 'prompt') {
          setCopyablePrompt(data.copyablePrompt);
          setShowPrompt(true);
          setShowSelection(false);
          if (data.error) {
            setError(data.error);
          }
        }
      } else {
        setError(data.error || 'Failed to generate insight');
      }
    } catch (err: any) {
      setError(`Failed to connect to AI service: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const copyPromptToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(copyablePrompt);
      alert('Prompt copied to clipboard! 📋');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = copyablePrompt;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Prompt copied to clipboard! 📋');
    }
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.APPLIED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case JobStatus.INTERVIEWING:
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case JobStatus.OFFER:
        return 'bg-green-100 text-green-800 border-green-200';
      case JobStatus.REJECTED:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 text-sm sm:text-base">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Enhanced Responsive Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-4">
            <Brain className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-purple-600" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Career Insights
            </h1>
          </div>
          <p className="text-slate-600 text-sm sm:text-base lg:text-lg px-4">
            Choose specific applications to get targeted AI analysis
          </p>
        </div>

        {/* Enhanced Responsive Main Content Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          
          {/* No Data State - Responsive */}
          {jobs.length === 0 && (
            <div className="p-6 sm:p-8 lg:p-12 text-center">
              <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6">🧠</div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-900 mb-3 sm:mb-4">Ready to Analyze Your Job Search</h3>
              <p className="text-slate-600 mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg px-4">
                Add some job applications first, then come back for AI-powered insights
              </p>
              <a
                href="/applications"
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center justify-center space-x-2 text-base sm:text-lg font-medium"
              >
                <span>Add Applications</span>
                <span>→</span>
              </a>
            </div>
          )}

          {/* Initial State - Responsive */}
          {jobs.length > 0 && !insight && !generating && !showSelection && !showPrompt && (
            <div className="p-6 sm:p-8 lg:p-12 text-center">
              <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6">✨</div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-900 mb-3 sm:mb-4">Choose Applications to Analyze</h3>
              <p className="text-slate-600 mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg px-4">
                You have <span className="font-semibold text-purple-600">{jobs.length} applications</span>. Select specific ones for targeted insights.
              </p>
              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={() => setShowSelection(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center justify-center space-x-2 sm:space-x-3 text-base sm:text-lg font-medium"
                >
                  <Brain className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span>Select Applications</span>
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <div className="text-slate-500 text-xs sm:text-sm">
                  Or <button 
                    onClick={() => {
                      setSelectedJobs(new Set(jobs.map(job => job.id)));
                      generateInsight();
                    }}
                    className="text-purple-600 hover:text-purple-700 underline"
                  >
                    analyze all {jobs.length} applications
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Responsive Application Selection */}
          {showSelection && !generating && (
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900">Select Applications</h3>
                  <p className="text-slate-600 text-sm sm:text-base">Choose which applications to analyze ({selectedJobs.size} selected)</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={selectAllJobs}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium py-2 sm:py-0"
                  >
                    {selectedJobs.size === jobs.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <button
                    onClick={generateInsight}
                    disabled={selectedJobs.size === 0}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 sm:px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <Brain className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Analyze ({selectedJobs.size})</span>
                  </button>
                </div>
              </div>

              {/* Enhanced Responsive Applications List */}
              <div className="space-y-3 max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => toggleJobSelection(job.id)}
                    className={`
                      p-3 sm:p-4 rounded-xl border cursor-pointer transition-all duration-200
                      ${selectedJobs.has(job.id)
                        ? 'border-purple-300 bg-purple-50 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div className={`
                          w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0
                          ${selectedJobs.has(job.id)
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-slate-300'
                          }
                        `}>
                          {selectedJobs.has(job.id) && (
                            <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                          <Building className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <h4 className="font-semibold text-slate-900 text-sm sm:text-base truncate">{job.title}</h4>
                            <p className="text-xs sm:text-sm text-slate-600 truncate">{job.company}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 flex-shrink-0">
                        <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                        
                        <div className="hidden sm:flex items-center space-x-1 text-sm text-slate-500">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(job.dateApplied).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Mobile Date Display */}
                    <div className="sm:hidden flex items-center space-x-1 text-xs text-slate-500 mt-2 pl-8">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(job.dateApplied).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Responsive Selection Footer */}
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 sm:pt-6 border-t border-slate-200 space-y-2 sm:space-y-0">
                <button
                  onClick={() => setShowSelection(false)}
                  className="text-slate-600 hover:text-slate-700 px-4 py-2 text-sm sm:text-base"
                >
                  ← Back
                </button>
                <div className="text-xs sm:text-sm text-slate-500 text-center sm:text-right">
                  {selectedJobs.size} of {jobs.length} applications selected
                </div>
              </div>
            </div>
          )}

          {/* Responsive Generating State */}
          {generating && (
            <div className="p-6 sm:p-8 lg:p-12 text-center">
              <div className="mb-4 sm:mb-6">
                <Loader2 className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 text-purple-600 mx-auto animate-spin" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-900 mb-3 sm:mb-4">AI is Analyzing Your Data</h3>
              <p className="text-slate-600 text-sm sm:text-base lg:text-lg px-4">
                Analyzing {selectedJobs.size} applications... This usually takes 10-15 seconds.
              </p>
            </div>
          )}

          {/* Responsive Error State */}
          {error && !showPrompt && (
            <div className="p-6 sm:p-8 lg:p-12 text-center">
              <div className="bg-red-100 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-4 sm:mb-6">
                <AlertCircle className="h-6 w-6 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-red-600" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-red-900 mb-3 sm:mb-4">Analysis Error</h3>
              <p className="text-red-700 mb-6 sm:mb-8 text-sm sm:text-base px-4">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setShowSelection(true);
                }}
                className="w-full sm:w-auto bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors text-sm sm:text-base"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Enhanced Responsive Results */}
          {insight && (
            <div className="p-4 sm:p-6 lg:p-8">
              {/* Responsive Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full p-2 sm:p-3">
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900">Your AI Analysis</h3>
                    <p className="text-slate-600 text-sm sm:text-base">Based on {selectedJobs.size} selected applications</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setInsight('');
                    setShowPrompt(false);
                    setShowSelection(true);
                  }}
                  className="w-full sm:w-auto bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <Brain className="h-4 w-4" />
                  <span>New Analysis</span>
                </button>
              </div>

              {/* Responsive Analysis Content */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-200">
                <div className="prose prose-slate max-w-none">
                  <div className="text-slate-800 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                    {insight}
                  </div>
                </div>
              </div>

              {/* Responsive Footer Info */}
              <div className="mt-6 sm:mt-8 text-center">
                <p className="text-slate-500 text-xs sm:text-sm">
                  💡 Powered by OpenAI GPT-3.5 • 
                  <button 
                    onClick={() => {
                      setInsight('');
                      setShowSelection(true);
                    }}
                    className="text-purple-600 hover:text-purple-700 ml-1 underline"
                  >
                    Analyze different applications
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Enhanced Responsive Prompt Copying Section */}
          {showPrompt && (
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full p-2 sm:p-3 w-fit">
                    <Brain className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900">Copy & Paste Prompt</h3>
                    <p className="text-slate-600 text-sm sm:text-base">Use this prompt with any AI service for free analysis</p>
                  </div>
                </div>
                
                {error && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                    <p className="text-amber-800 text-xs sm:text-sm">{error}</p>
                  </div>
                )}
              </div>

              {/* Responsive AI Service Suggestions */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <a
                  href="https://chat.openai.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 text-center hover:bg-green-100 transition-colors"
                >
                  <div className="font-semibold text-green-900 text-sm sm:text-base">ChatGPT</div>
                  <div className="text-green-700 text-xs sm:text-sm">Free tier available</div>
                </a>
                <a
                  href="https://claude.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-center hover:bg-blue-100 transition-colors"
                >
                  <div className="font-semibold text-blue-900 text-sm sm:text-base">Claude</div>
                  <div className="text-blue-700 text-xs sm:text-sm">Free conversations</div>
                </a>
                <a
                  href="https://gemini.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4 text-center hover:bg-purple-100 transition-colors"
                >
                  <div className="font-semibold text-purple-900 text-sm sm:text-base">Google Gemini</div>
                  <div className="text-purple-700 text-xs sm:text-sm">Completely free</div>
                </a>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4 text-center">
                  <div className="font-semibold text-slate-900 text-sm sm:text-base">Any AI</div>
                  <div className="text-slate-700 text-xs sm:text-sm">Copy & paste</div>
                </div>
              </div>

              {/* Responsive Copyable Prompt */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-700 font-medium text-sm sm:text-base">AI Prompt</span>
                    <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded text-xs">
                      {selectedJobs.size} applications
                    </span>
                  </div>
                  <button
                    onClick={copyPromptToClipboard}
                    className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy Prompt</span>
                  </button>
                </div>
                
                <div className="p-4 sm:p-6">
                  <pre className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-mono bg-white rounded-lg p-3 sm:p-4 border border-slate-200 max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto">
{copyablePrompt}
                  </pre>
                </div>
              </div>

              {/* Responsive Instructions */}
              <div className="mt-4 sm:mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
                <h4 className="font-semibold text-blue-900 mb-3 text-sm sm:text-base">🚀 How to Use:</h4>
                <ol className="text-blue-800 text-xs sm:text-sm space-y-1 sm:space-y-2">
                  <li><strong>1.</strong> Click "Copy Prompt" above</li>
                  <li><strong>2.</strong> Choose any AI service (ChatGPT, Claude, Bard, etc.)</li>
                  <li><strong>3.</strong> Paste the prompt and get your analysis!</li>
                  <li><strong>4.</strong> Come back and try our AI again when credits are available</li>
                </ol>
              </div>

              {/* Responsive Footer */}
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                <button
                  onClick={() => {
                    setShowPrompt(false);
                    setShowSelection(true);
                  }}
                  className="text-slate-600 hover:text-slate-700 px-4 py-2 text-sm sm:text-base"
                >
                  ← Back to Selection
                </button>
                <div className="text-xs sm:text-sm text-slate-500 text-center sm:text-right">
                  Free alternative to AI analysis
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}