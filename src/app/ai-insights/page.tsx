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

      const data = await response.json();

      if (data.success) {
        setInsight(data.analysis);
        setShowSelection(false); // Hide selection after generating
      } else {
        setError(data.error || 'Failed to generate insight');
      }
    } catch (err) {
      setError('Failed to connect to AI service');
    } finally {
      setGenerating(false);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Simple Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Brain className="h-12 w-12 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Career Insights
            </h1>
          </div>
          <p className="text-slate-600 text-lg">
            Choose specific applications to get targeted AI analysis
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          
          {/* No Data State */}
          {jobs.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-6xl mb-6">🧠</div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">Ready to Analyze Your Job Search</h3>
              <p className="text-slate-600 mb-8 text-lg">
                Add some job applications first, then come back for AI-powered insights
              </p>
              <a
                href="/applications"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center space-x-2 text-lg font-medium"
              >
                <span>Add Applications</span>
                <span>→</span>
              </a>
            </div>
          )}

          {/* Selection Mode or Generate Button */}
          {jobs.length > 0 && !insight && !generating && !showSelection && (
            <div className="p-12 text-center">
              <div className="text-6xl mb-6">✨</div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">Choose Applications to Analyze</h3>
              <p className="text-slate-600 mb-8 text-lg">
                You have <span className="font-semibold text-purple-600">{jobs.length} applications</span>. Select specific ones for targeted insights.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => setShowSelection(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center space-x-3 text-lg font-medium"
                >
                  <Brain className="h-6 w-6" />
                  <span>Select Applications</span>
                  <Sparkles className="h-5 w-5" />
                </button>
                <div className="text-slate-500 text-sm">
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

          {/* Application Selection */}
          {showSelection && !generating && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Select Applications</h3>
                  <p className="text-slate-600">Choose which applications to analyze ({selectedJobs.size} selected)</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={selectAllJobs}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    {selectedJobs.size === jobs.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <button
                    onClick={generateInsight}
                    disabled={selectedJobs.size === 0}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Brain className="h-5 w-5" />
                    <span>Analyze ({selectedJobs.size})</span>
                  </button>
                </div>
              </div>

              {/* Applications List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => toggleJobSelection(job.id)}
                    className={`
                      p-4 rounded-xl border cursor-pointer transition-all duration-200
                      ${selectedJobs.has(job.id)
                        ? 'border-purple-300 bg-purple-50 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`
                          w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                          ${selectedJobs.has(job.id)
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-slate-300'
                          }
                        `}>
                          {selectedJobs.has(job.id) && (
                            <Check className="h-4 w-4 text-white" />
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Building className="h-5 w-5 text-slate-400" />
                          <div>
                            <h4 className="font-semibold text-slate-900">{job.title}</h4>
                            <p className="text-sm text-slate-600">{job.company}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                        
                        <div className="flex items-center space-x-1 text-sm text-slate-500">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(job.dateApplied).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selection Footer */}
              <div className="mt-6 flex items-center justify-between pt-6 border-t border-slate-200">
                <button
                  onClick={() => setShowSelection(false)}
                  className="text-slate-600 hover:text-slate-700 px-4 py-2"
                >
                  ← Back
                </button>
                <div className="text-sm text-slate-500">
                  {selectedJobs.size} of {jobs.length} applications selected
                </div>
              </div>
            </div>
          )}

          {/* Generating State */}
          {generating && (
            <div className="p-12 text-center">
              <div className="mb-6">
                <Loader2 className="h-16 w-16 text-purple-600 mx-auto animate-spin" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">AI is Analyzing Your Data</h3>
              <p className="text-slate-600 text-lg">
                Analyzing {selectedJobs.size} applications... This usually takes 10-15 seconds.
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-12 text-center">
              <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-6">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-semibold text-red-900 mb-4">Analysis Error</h3>
              <p className="text-red-700 mb-8">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setShowSelection(true);
                }}
                className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Results */}
          {insight && (
            <div className="p-8">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full p-3">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Your AI Analysis</h3>
                    <p className="text-slate-600">Based on {selectedJobs.size} selected applications</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setInsight('');
                    setShowSelection(true);
                  }}
                  className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors flex items-center space-x-2"
                >
                  <Brain className="h-4 w-4" />
                  <span>New Analysis</span>
                </button>
              </div>

              {/* Analysis Content */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 border border-slate-200">
                <div className="prose prose-slate max-w-none">
                  <div className="text-slate-800 leading-relaxed whitespace-pre-wrap text-base">
                    {insight}
                  </div>
                </div>
              </div>

              {/* Footer Info */}
              <div className="mt-8 text-center">
                <p className="text-slate-500 text-sm">
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
        </div>


      </div>
    </div>
  );
}