'use client';

import { useState } from 'react';
import { Brain, Sparkles, Target, MessageSquare, X } from 'lucide-react';
import { Job } from '@/types/job';

interface AIAnalysisProps {
    job: Job;
    isOpen: boolean;
    onClose: () => void;
}

export default function AIAnalysis({ job, isOpen, onClose }: AIAnalysisProps) {
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [analysisType, setAnalysisType] = useState<'job-analysis' | 'application-status' | 'interview-preparation'>('job-analysis');
    const [copyablePrompt, setCopyablePrompt] = useState<string>('');
    const [showPrompt, setShowPrompt] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ✅ Fix 1: Use consistent API endpoint and simplified flow
    const analyzeJob = async (type: string) => {
        setLoading(true);
        setAnalysisType(type as any);
        setError(null);
        setShowPrompt(false);
        setAnalysis(null); // Clear previous analysis

        try {
            console.log('Sending single job analysis request...');
            console.log('Job data:', job);
            console.log('Analysis type:', type);
            
            const response = await fetch('/api/ai-insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobs: [job], // Send as array to match API
                    analysisType: type
                }),
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Full API response:', data);

            if (data.success) {
                if (data.mode === 'ai' && data.analysis) {
                    // AI analysis successful
                    console.log('Setting AI analysis:', data.analysis);
                    setAnalysis(data.analysis);
                } else if (data.mode === 'prompt' && data.copyablePrompt) {
                    // Show copyable prompt
                    console.log('Setting copyable prompt');
                    setCopyablePrompt(data.copyablePrompt);
                    setShowPrompt(true);
                    if (data.error) {
                        setError(data.error);
                    }
                } else {
                    // Unexpected response format
                    console.log('Unexpected response format:', data);
                    setError('Received unexpected response format from AI service');
                    setAnalysis('Unexpected response format. Please try again.');
                }
            } else {
                console.log('API returned success: false');
                setError(data.error || 'Failed to generate analysis');
                setAnalysis('Sorry, unable to generate analysis at this time.');
            }
        } catch (error) {
            console.error('Analysis error:', error);
            setError(`Failed to connect to AI service: ${error}`);
            setAnalysis('Error generating analysis. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const copyPromptToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(copyablePrompt);
            alert('Prompt copied to clipboard! 📋');
        } catch (err) {
            console.error('Failed to copy:', err);
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Brain className="h-6 w-6" />
                            <div>
                                <h2 className="text-xl font-semibold">AI Career Assistant</h2>
                                <p className="text-purple-100">{job.title} at {job.company}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Analysis Type Buttons */}
                    <div className="flex flex-wrap gap-3 mb-6">
                        <button
                            onClick={() => analyzeJob('job-analysis')}
                            disabled={loading}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                analysisType === 'job-analysis'
                                ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <Target className="h-4 w-4" />
                            <span>Job Analysis</span>
                        </button>
                        
                        <button
                            onClick={() => analyzeJob('application-status')}
                            disabled={loading}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                analysisType === 'application-status'
                                ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <Sparkles className="h-4 w-4" />
                            <span>Next Steps</span>
                        </button>
                        
                        <button
                            onClick={() => analyzeJob('interview-preparation')}
                            disabled={loading}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                analysisType === 'interview-preparation'
                                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <MessageSquare className="h-4 w-4" />
                            <span>Interview Prep</span>
                        </button>

                        {/* Add this button temporarily for testing */}
                        <button
                            onClick={() => {
                                console.log('Test button clicked');
                                console.log('Current job:', job);
                                setAnalysis('Test analysis - this proves the UI works!');
                            }}
                            className="bg-red-100 text-red-700 px-4 py-2 rounded-lg"
                        >
                            TEST UI
                        </button>
                    </div>

                    {/* Error Display */}
                    {error && !showPrompt && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Analysis Result */}
                    {!showPrompt && (
                        <div className="bg-gray-50 rounded-xl p-6 min-h-[300px]">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                                        <p className="text-gray-600">AI is analyzing your job application...</p>
                                    </div>
                                </div>
                            ) : analysis ? (
                                <div className="prose prose-gray max-w-none">
                                    <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                                        {analysis}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 h-full flex items-center justify-center">
                                    <div>
                                        <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p>Select an analysis type above to get AI-powered insights!</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ✅ Fix 2: Copy Prompt Mode - Fixed missing setShowSelection */}
                    {showPrompt && (
                        <div className="mt-6">
                            <div className="mb-6">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full p-3">
                                        <Brain className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-slate-900">Copy & Paste Prompt</h3>
                                        <p className="text-slate-600">Use this prompt with any AI service for free analysis</p>
                                    </div>
                                </div>
                                
                                {error && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                                        <p className="text-amber-800 text-sm">{error}</p>
                                    </div>
                                )}
                            </div>

                            {/* AI Service Suggestions */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <a
                                    href="https://chat.openai.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-green-50 border border-green-200 rounded-lg p-4 text-center hover:bg-green-100 transition-colors"
                                >
                                    <div className="font-semibold text-green-900">ChatGPT</div>
                                    <div className="text-green-700 text-sm">Free tier available</div>
                                </a>
                                <a
                                    href="https://claude.ai"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center hover:bg-blue-100 transition-colors"
                                >
                                    <div className="font-semibold text-blue-900">Claude</div>
                                    <div className="text-blue-700 text-sm">Free conversations</div>
                                </a>
                                <a
                                    href="https://bard.google.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center hover:bg-purple-100 transition-colors"
                                >
                                    <div className="font-semibold text-purple-900">Google Bard</div>
                                    <div className="text-purple-700 text-sm">Completely free</div>
                                </a>
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                                    <div className="font-semibold text-slate-900">Any AI</div>
                                    <div className="text-slate-700 text-sm">Copy & paste</div>
                                </div>
                            </div>

                            {/* Copyable Prompt */}
                            <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                                <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-slate-700 font-medium">AI Prompt</span>
                                        <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded text-xs">
                                            Single job analysis
                                        </span>
                                    </div>
                                    <button
                                        onClick={copyPromptToClipboard}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <span>Copy Prompt</span>
                                    </button>
                                </div>
                                
                                <div className="p-6">
                                    <pre className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-mono bg-white rounded-lg p-4 border border-slate-200 max-h-96 overflow-y-auto">
{copyablePrompt}
                                    </pre>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
                                <h4 className="font-semibold text-blue-900 mb-3">🚀 How to Use:</h4>
                                <ol className="text-blue-800 text-sm space-y-2">
                                    <li><strong>1.</strong> Click "Copy Prompt" above</li>
                                    <li><strong>2.</strong> Choose any AI service (ChatGPT, Claude, Bard, etc.)</li>
                                    <li><strong>3.</strong> Paste the prompt and get your analysis!</li>
                                    <li><strong>4.</strong> Come back and try our AI again when credits are available</li>
                                </ol>
                            </div>

                            {/* Footer */}
                            <div className="mt-6 flex justify-between items-center">
                                <button
                                    onClick={() => setShowPrompt(false)}
                                    className="text-slate-600 hover:text-slate-700 px-4 py-2"
                                >
                                    ← Back to Analysis
                                </button>
                                <div className="text-sm text-slate-500">
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
