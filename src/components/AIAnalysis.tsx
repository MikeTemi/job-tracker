'use client';

import { useState } from 'react';
import { Brain, Sparkles, Target, MessageSquare, X } from           'lucide-react';
import { Job } from '@/types/job';

interface AIAnalysisProps {
    job: Job;
    isOpen: boolean;
    onClose: () => void;
}

export default function AIAnalysis({ job, isOpen, onClose }: AIAnalysisProps) {
    const [analysis,setAnalysis] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [analysisType, setAnalysisType] = useState<'job-analysis' | 'application-status' | 'interview-preparation'>('job-analysis');

    const analyzeJob = async (type: string) => {
        setLoading(true);
        setAnalysisType(type as any);

        try {
            const response = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobTitle: job.title,
                    company: job.company,
                    jobDescription: `${job.title} position at ${job.company}`,
                    analysisType: type
                }),
            });

            const data = await response.json();

            if (data.success) {
                setAnalysis(data.analysis);
            } else {
                setAnalysis('Sorry, unable to generate analysis at this time.');
            }
        } catch (error) {
            console.error('Analysis error:', error);
            setAnalysis('Error generating analysis. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
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
                </div>

                {/* Analysis Result */}
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
            </div>
        </div>
    </div>
    );
}
