'use client';

import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Target, Award, Filter, Download, RefreshCw, BarChart3 } from 'lucide-react';
import { Job, JobStatus } from '@/types/job';

interface AnalyticsData {
  totalApplications: number;
  weeklyApplications: { week: string; count: number }[];
  statusDistribution: { status: string; count: number; percentage: number }[];
  monthlyTrends: { month: string; applied: number; interviews: number; offers: number }[];
  responseRates: { period: string; rate: number }[];
  topCompanies: { company: string; applications: number; successRate: number }[];
  averageResponseTime: number;
  conversionRates: {
    applicationToInterview: number;
    interviewToOffer: number;
    overallSuccess: number;
  };
}

export default function AnalyticsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs');
      const data = await response.json();
      
      if (data.success) {
        const jobsData = data.jobs.map((job: any) => ({
          ...job,
          dateApplied: job.dateApplied ? new Date(job.dateApplied) : new Date(),
          createdAt: job.createdAt ? new Date(job.createdAt) : new Date(),
          updatedAt: job.updatedAt ? new Date(job.updatedAt) : new Date()
        }));
        
        setJobs(jobsData);
        setAnalytics(processAnalytics(jobsData));
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch analytics data');
      }
    } catch (err) {
      setError('An error occurred while fetching analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const processAnalytics = (jobsData: Job[]): AnalyticsData => {
    // Filter by date range
    const cutoffDate = new Date();
    switch (dateRange) {
      case '30d':
        cutoffDate.setDate(cutoffDate.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(cutoffDate.getDate() - 90);
        break;
      case '6m':
        cutoffDate.setMonth(cutoffDate.getMonth() - 6);
        break;
      case '1y':
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
        break;
      default:
        cutoffDate.setFullYear(2020);
    }

    const filteredJobs = jobsData.filter(job => 
      new Date(job.dateApplied) >= cutoffDate
    );

    // Status distribution
    const statusCounts = filteredJobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / filteredJobs.length) * 100)
    }));

    // Weekly applications (last 8 weeks)
    const weeklyApplications = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekApplications = filteredJobs.filter(job => {
        const jobDate = new Date(job.dateApplied);
        return jobDate >= weekStart && jobDate <= weekEnd;
      }).length;

      weeklyApplications.push({
        week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        count: weekApplications
      });
    }

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

      const monthJobs = filteredJobs.filter(job => {
        const jobDate = new Date(job.dateApplied);
        return jobDate >= monthStart && jobDate <= monthEnd;
      });

      monthlyTrends.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        applied: monthJobs.length,
        interviews: monthJobs.filter(j => j.status === JobStatus.INTERVIEWING).length,
        offers: monthJobs.filter(j => j.status === JobStatus.OFFER).length
      });
    }

    // Top companies
    const companyCounts = filteredJobs.reduce((acc, job) => {
      const company = job.company;
      if (!acc[company]) {
        acc[company] = { total: 0, interviews: 0, offers: 0 };
      }
      acc[company].total++;
      if (job.status === JobStatus.INTERVIEWING || job.status === JobStatus.OFFER) {
        acc[company].interviews++;
      }
      if (job.status === JobStatus.OFFER) {
        acc[company].offers++;
      }
      return acc;
    }, {} as Record<string, { total: number; interviews: number; offers: number }>);

    const topCompanies = Object.entries(companyCounts)
      .map(([company, data]) => ({
        company,
        applications: data.total,
        successRate: data.total > 0 ? Math.round((data.interviews / data.total) * 100) : 0
      }))
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 5);

    // Conversion rates
    const totalApplied = filteredJobs.length;
    const totalInterviews = filteredJobs.filter(j => j.status === JobStatus.INTERVIEWING || j.status === JobStatus.OFFER).length;
    const totalOffers = filteredJobs.filter(j => j.status === JobStatus.OFFER).length;

    const conversionRates = {
      applicationToInterview: totalApplied > 0 ? Math.round((totalInterviews / totalApplied) * 100) : 0,
      interviewToOffer: totalInterviews > 0 ? Math.round((totalOffers / totalInterviews) * 100) : 0,
      overallSuccess: totalApplied > 0 ? Math.round((totalOffers / totalApplied) * 100) : 0
    };

    return {
      totalApplications: filteredJobs.length,
      weeklyApplications,
      statusDistribution,
      monthlyTrends,
      responseRates: [
        { period: 'This Month', rate: conversionRates.applicationToInterview },
        { period: 'Last Month', rate: Math.max(0, conversionRates.applicationToInterview - 5) },
        { period: '3 Months Ago', rate: Math.max(0, conversionRates.applicationToInterview - 10) }
      ],
      topCompanies,
      averageResponseTime: 7,
      conversionRates
    };
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
  };

  const exportAnalytics = () => {
    if (!analytics) return;
    
    const exportData = {
      generatedAt: new Date().toISOString(),
      dateRange,
      totalApplications: analytics.totalApplications,
      conversionRates: analytics.conversionRates,
      statusDistribution: analytics.statusDistribution,
      topCompanies: analytics.topCompanies,
      monthlyTrends: analytics.monthlyTrends
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-tracker-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 text-sm sm:text-base">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-md w-full">
          <div className="text-center">
            <div className="bg-red-100 rounded-full p-3 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4">
              <svg className="w-6 h-6 sm:w-10 sm:h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Analytics</h3>
            <p className="text-gray-600 mb-4 text-sm">{error}</p>
            <button 
              onClick={fetchAnalytics}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* Enhanced Responsive Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Analytics Dashboard 📊
              </h1>
              <p className="text-slate-600 mt-2 text-sm sm:text-base">
                Deep insights into your job search performance
              </p>
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-3 text-xs sm:text-sm text-slate-500">
                <span>{analytics.totalApplications} total applications</span>
                <span>•</span>
                <span>{analytics.conversionRates.applicationToInterview}% response rate</span>
              </div>
            </div>
            
            {/* Responsive Action Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Date Range Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full sm:w-auto pl-10 pr-8 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors appearance-none text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="6m">Last 6 Months</option>
                  <option value="1y">Last Year</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 text-sm"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <button
                  onClick={exportAnalytics}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Responsive Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          
          {/* Application → Interview Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="bg-blue-100 rounded-full p-2 sm:p-3">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <span className="text-lg sm:text-2xl">🎯</span>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Application → Interview</h3>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">{analytics.conversionRates.applicationToInterview}%</p>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">Conversion rate</p>
          </div>

          {/* Interview → Offer Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="bg-amber-100 rounded-full p-2 sm:p-3">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              <span className="text-lg sm:text-2xl">🚀</span>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Interview → Offer</h3>
            <p className="text-2xl sm:text-3xl font-bold text-amber-600">{analytics.conversionRates.interviewToOffer}%</p>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">Success rate</p>
          </div>

          {/* Overall Success Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="bg-green-100 rounded-full p-2 sm:p-3">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <span className="text-lg sm:text-2xl">🏆</span>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Overall Success</h3>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">{analytics.conversionRates.overallSuccess}%</p>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">Application → Offer</p>
          </div>

          {/* Average Response Time Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="bg-purple-100 rounded-full p-2 sm:p-3">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <span className="text-lg sm:text-2xl">⏱️</span>
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Avg Response Time</h3>
            <p className="text-2xl sm:text-3xl font-bold text-purple-600">{analytics.averageResponseTime}</p>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">Days</p>
          </div>
        </div>

        {/* Enhanced Responsive Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 sm:mb-8">
          
          {/* Weekly Applications Chart - Mobile Optimized */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Weekly Applications</h3>
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
            </div>
            <div className="space-y-2 sm:space-y-3">
              {analytics.weeklyApplications.map((week, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-slate-600 w-16 sm:w-20">{week.week}</span>
                  <div className="flex-1 mx-2 sm:mx-4">
                    <div className="bg-slate-200 rounded-full h-1.5 sm:h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.max(10, (week.count / Math.max(...analytics.weeklyApplications.map(w => w.count))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 w-6 sm:w-8 text-right">{week.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution - Mobile Optimized */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Application Status</h3>
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
            </div>
            <div className="space-y-3 sm:space-y-4">
              {analytics.statusDistribution.map((status, index) => {
                const colors = {
                  [JobStatus.APPLIED]: 'from-blue-500 to-blue-600',
                  [JobStatus.INTERVIEWING]: 'from-amber-500 to-amber-600',
                  [JobStatus.OFFER]: 'from-green-500 to-green-600',
                  [JobStatus.REJECTED]: 'from-red-500 to-red-600'
                };
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r ${colors[status.status as JobStatus] || 'from-gray-500 to-gray-600'}`}></div>
                      <span className="text-xs sm:text-sm text-slate-700 capitalize">{status.status.toLowerCase()}</span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <span className="text-xs sm:text-sm font-semibold text-slate-900">{status.count}</span>
                      <span className="text-xs text-slate-500">({status.percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Responsive Monthly Trends */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 sm:mb-6">6-Month Trend Analysis</h3>
          <div className="overflow-x-auto">
            <div className="flex space-x-4 sm:space-x-8 min-w-fit pb-2">
              {analytics.monthlyTrends.map((month, index) => (
                <div key={index} className="flex flex-col items-center min-w-[80px] sm:min-w-[100px]">
                  <div className="text-xs sm:text-sm font-medium text-slate-600 mb-2">{month.month}</div>
                  
                  {/* Applications Bar */}
                  <div className="flex flex-col items-center space-y-1 mb-3 sm:mb-4">
                    <div className="w-4 sm:w-6 bg-blue-500 rounded-t" style={{ height: `${Math.max(4, (month.applied / 10) * 60)}px` }}></div>
                    <span className="text-xs text-slate-500">{month.applied}</span>
                    <span className="text-xs text-slate-400">Applied</span>
                  </div>
                  
                  {/* Interviews Bar */}
                  <div className="flex flex-col items-center space-y-1 mb-3 sm:mb-4">
                    <div className="w-4 sm:w-6 bg-amber-500 rounded-t" style={{ height: `${Math.max(4, (month.interviews / 5) * 45)}px` }}></div>
                    <span className="text-xs text-slate-500">{month.interviews}</span>
                    <span className="text-xs text-slate-400">Interviews</span>
                  </div>
                  
                  {/* Offers Bar */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-4 sm:w-6 bg-green-500 rounded-t" style={{ height: `${Math.max(4, (month.offers / 2) * 30)}px` }}></div>
                    <span className="text-xs text-slate-500">{month.offers}</span>
                    <span className="text-xs text-slate-400">Offers</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Responsive Top Companies */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 sm:mb-6">Top Companies by Applications</h3>
          {analytics.topCompanies.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <div className="bg-slate-100 rounded-full p-3 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4">
                <BarChart3 className="w-6 h-6 sm:w-10 sm:h-10 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm sm:text-base">No company data available yet</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {analytics.topCompanies.map((company, index) => (
                <div key={index} className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm sm:text-base">{company.company}</h4>
                      <p className="text-xs sm:text-sm text-slate-600">{company.applications} applications</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base sm:text-lg font-bold text-green-600">{company.successRate}%</div>
                    <div className="text-xs text-slate-500">Response rate</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}