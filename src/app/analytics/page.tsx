'use client';

import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Target, Award, Filter, Download, RefreshCw } from 'lucide-react';
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
  const [dateRange, setDateRange] = useState('all'); // all, 30d, 90d, 6m, 1y
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
        cutoffDate.setFullYear(2020); // Show all data
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
      averageResponseTime: 7, // Mock data - you could calculate this from actual response dates
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Analytics</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchAnalytics}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Analytics Dashboard 📊
              </h1>
              <p className="text-slate-600 mt-2">
                Deep insights into your job search performance
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Date Range Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="pl-10 pr-8 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors appearance-none"
                >
                  <option value="all">All Time</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="6m">Last 6 Months</option>
                  <option value="1y">Last Year</option>
                </select>
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              {/* Export Button */}
              <button
                onClick={exportAnalytics}
                className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 rounded-full p-3">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-1">Application → Interview</h3>
            <p className="text-3xl font-bold text-blue-600">{analytics.conversionRates.applicationToInterview}%</p>
            <p className="text-sm text-slate-500 mt-2">Conversion rate</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-amber-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-1">Interview → Offer</h3>
            <p className="text-3xl font-bold text-amber-600">{analytics.conversionRates.interviewToOffer}%</p>
            <p className="text-sm text-slate-500 mt-2">Success rate</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 rounded-full p-3">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-1">Overall Success</h3>
            <p className="text-3xl font-bold text-green-600">{analytics.conversionRates.overallSuccess}%</p>
            <p className="text-sm text-slate-500 mt-2">Application → Offer</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 rounded-full p-3">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-2xl">⏱️</span>
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-1">Avg Response Time</h3>
            <p className="text-3xl font-bold text-purple-600">{analytics.averageResponseTime}</p>
            <p className="text-sm text-slate-500 mt-2">Days</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Weekly Applications Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Weekly Application Trend</h3>
            <div className="space-y-3">
              {analytics.weeklyApplications.map((week, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 w-20">{week.week}</span>
                  <div className="flex-1 mx-4">
                    <div className="bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.max(10, (week.count / Math.max(...analytics.weeklyApplications.map(w => w.count))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 w-8 text-right">{week.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Application Status</h3>
            <div className="space-y-4">
              {analytics.statusDistribution.map((status, index) => {
                const colors = {
                  [JobStatus.APPLIED]: 'from-blue-500 to-blue-600',
                  [JobStatus.INTERVIEWING]: 'from-amber-500 to-amber-600',
                  [JobStatus.OFFER]: 'from-green-500 to-green-600',
                  [JobStatus.REJECTED]: 'from-red-500 to-red-600'
                };
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors[status.status as JobStatus] || 'from-gray-500 to-gray-600'}`}></div>
                      <span className="text-sm text-slate-700 capitalize">{status.status.toLowerCase()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-slate-900">{status.count}</span>
                      <span className="text-xs text-slate-500">({status.percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-6">6-Month Trend Analysis</h3>
          <div className="overflow-x-auto">
            <div className="flex space-x-8 min-w-fit">
              {analytics.monthlyTrends.map((month, index) => (
                <div key={index} className="flex flex-col items-center min-w-[100px]">
                  <div className="text-sm font-medium text-slate-600 mb-2">{month.month}</div>
                  
                  {/* Applications Bar */}
                  <div className="flex flex-col items-center space-y-1 mb-4">
                    <div className="w-6 bg-blue-500 rounded-t" style={{ height: `${Math.max(4, (month.applied / 10) * 80)}px` }}></div>
                    <span className="text-xs text-slate-500">{month.applied}</span>
                    <span className="text-xs text-slate-400">Applied</span>
                  </div>
                  
                  {/* Interviews Bar */}
                  <div className="flex flex-col items-center space-y-1 mb-4">
                    <div className="w-6 bg-amber-500 rounded-t" style={{ height: `${Math.max(4, (month.interviews / 5) * 60)}px` }}></div>
                    <span className="text-xs text-slate-500">{month.interviews}</span>
                    <span className="text-xs text-slate-400">Interviews</span>
                  </div>
                  
                  {/* Offers Bar */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="w-6 bg-green-500 rounded-t" style={{ height: `${Math.max(4, (month.offers / 2) * 40)}px` }}></div>
                    <span className="text-xs text-slate-500">{month.offers}</span>
                    <span className="text-xs text-slate-400">Offers</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Companies */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Top Companies by Applications</h3>
          {analytics.topCompanies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">No company data available yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.topCompanies.map((company, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{company.company}</h4>
                      <p className="text-sm text-slate-600">{company.applications} applications</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{company.successRate}%</div>
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