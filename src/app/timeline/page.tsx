'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Building, Users, ExternalLink, Filter, Plus, ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import { Job, JobStatus } from '@/types/job';
import AddJobForm from '@/components/AddJobForm';

interface TimelineEvent {
  id: string;
  type: 'application' | 'interview' | 'offer' | 'rejection' | 'follow-up';
  date: Date;
  title: string;
  company: string;
  job: Job;
  status: JobStatus;
  description?: string;
}

export default function TimelinePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (jobs.length > 0) {
      generateTimelineEvents();
    }
  }, [jobs, filterStatus, selectedDateRange]);

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

  const generateTimelineEvents = () => {
    let events: TimelineEvent[] = [];
    
    // Filter jobs by date range
    const cutoffDate = new Date();
    switch (selectedDateRange) {
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

    const filteredJobs = jobs.filter(job => 
      new Date(job.dateApplied) >= cutoffDate &&
      (filterStatus === 'all' || job.status === filterStatus)
    );

    filteredJobs.forEach(job => {
      // Application event
      events.push({
        id: `${job.id}-application`,
        type: 'application',
        date: new Date(job.dateApplied),
        title: `Applied to ${job.title}`,
        company: job.company,
        job: job,
        status: job.status,
        description: `Submitted application for ${job.title} position`
      });

      // Generate follow-up events based on status
      if (job.status === JobStatus.INTERVIEWING) {
        const interviewDate = new Date(job.dateApplied);
        interviewDate.setDate(interviewDate.getDate() + Math.floor(Math.random() * 14) + 3); // 3-17 days later
        
        events.push({
          id: `${job.id}-interview`,
          type: 'interview',
          date: interviewDate,
          title: `Interview scheduled`,
          company: job.company,
          job: job,
          status: job.status,
          description: `Interview scheduled for ${job.title} position`
        });
      } else if (job.status === JobStatus.OFFER) {
        const interviewDate = new Date(job.dateApplied);
        interviewDate.setDate(interviewDate.getDate() + Math.floor(Math.random() * 14) + 3);
        
        const offerDate = new Date(interviewDate);
        offerDate.setDate(offerDate.getDate() + Math.floor(Math.random() * 7) + 1); // 1-7 days after interview
        
        events.push({
          id: `${job.id}-interview`,
          type: 'interview',
          date: interviewDate,
          title: `Interview completed`,
          company: job.company,
          job: job,
          status: job.status,
          description: `Interview completed for ${job.title} position`
        });

        events.push({
          id: `${job.id}-offer`,
          type: 'offer',
          date: offerDate,
          title: `Offer received! 🎉`,
          company: job.company,
          job: job,
          status: job.status,
          description: `Job offer received for ${job.title} position`
        });
      } else if (job.status === JobStatus.REJECTED) {
        const rejectionDate = new Date(job.dateApplied);
        rejectionDate.setDate(rejectionDate.getDate() + Math.floor(Math.random() * 21) + 7); // 7-28 days later
        
        events.push({
          id: `${job.id}-rejection`,
          type: 'rejection',
          date: rejectionDate,
          title: `Application declined`,
          company: job.company,
          job: job,
          status: job.status,
          description: `Received rejection for ${job.title} position`
        });
      }
    });

    // Sort events by date (newest first)
    events.sort((a, b) => b.date.getTime() - a.date.getTime());
    setTimelineEvents(events);
  };

  const toggleEventExpansion = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <Building className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'interview':
        return <Users className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'offer':
        return <span className="text-base sm:text-lg">🎉</span>;
      case 'rejection':
        return <span className="text-base sm:text-lg">❌</span>;
      default:
        return <Clock className="h-4 w-4 sm:h-5 sm:w-5" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'application':
        return 'bg-blue-500 border-blue-200';
      case 'interview':
        return 'bg-amber-500 border-amber-200';
      case 'offer':
        return 'bg-green-500 border-green-200';
      case 'rejection':
        return 'bg-red-500 border-red-200';
      default:
        return 'bg-gray-500 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: JobStatus) => {
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

  const groupEventsByDate = (events: TimelineEvent[]) => {
    const grouped: { [key: string]: TimelineEvent[] } = {};
    events.forEach(event => {
      const dateKey = event.date.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 text-sm sm:text-base">Loading timeline...</p>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Timeline</h3>
            <p className="text-gray-600 mb-4 text-sm">{error}</p>
            <button 
              onClick={fetchJobs}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const groupedEvents = groupEventsByDate(timelineEvents);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Enhanced Responsive Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Application Timeline 📅
              </h1>
              <p className="text-slate-600 mt-2 text-sm sm:text-base">
                Track your job search journey chronologically
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs sm:text-sm text-slate-500">
                <span>{timelineEvents.length} total events</span>
                <span>•</span>
                <span>{Object.keys(groupedEvents).length} active days</span>
              </div>
            </div>
            
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm"
              >
                <Filter className="h-4 w-4" />
                <span>Filters & Actions</span>
                {showFilters ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>

            {/* Desktop Controls */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-3 lg:space-y-0 lg:space-x-3">
                {/* Status Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full lg:w-auto pl-10 pr-8 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors appearance-none text-sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value={JobStatus.APPLIED}>Applied</option>
                    <option value={JobStatus.INTERVIEWING}>Interviewing</option>
                    <option value={JobStatus.OFFER}>Offers</option>
                    <option value={JobStatus.REJECTED}>Rejected</option>
                  </select>
                </div>

                {/* Date Range Filter */}
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <select
                    value={selectedDateRange}
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                    className="w-full lg:w-auto pl-10 pr-8 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors appearance-none text-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                    <option value="6m">Last 6 Months</option>
                    <option value="1y">Last Year</option>
                  </select>
                </div>

                {/* Add Event Button */}
                <button
                  onClick={() => setIsAddFormOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group text-sm"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-90 transition-transform duration-200" />
                  <span className="hidden sm:inline">Add Event</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Responsive Timeline Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-3 sm:p-6 text-center">
            <div className="text-xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">
              {timelineEvents.filter(e => e.type === 'application').length}
            </div>
            <div className="text-xs sm:text-sm text-slate-600">Applications</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-3 sm:p-6 text-center">
            <div className="text-xl sm:text-3xl font-bold text-amber-600 mb-1 sm:mb-2">
              {timelineEvents.filter(e => e.type === 'interview').length}
            </div>
            <div className="text-xs sm:text-sm text-slate-600">Interviews</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-3 sm:p-6 text-center">
            <div className="text-xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">
              {timelineEvents.filter(e => e.type === 'offer').length}
            </div>
            <div className="text-xs sm:text-sm text-slate-600">Offers</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-3 sm:p-6 text-center">
            <div className="text-xl sm:text-3xl font-bold text-slate-600 mb-1 sm:mb-2">
              {Object.keys(groupedEvents).length}
            </div>
            <div className="text-xs sm:text-sm text-slate-600">Active Days</div>
          </div>
        </div>

        {/* Enhanced Responsive Timeline */}
        {timelineEvents.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 sm:p-12 text-center">
            <div className="text-4xl sm:text-6xl mb-4">📅</div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">No Timeline Events</h3>
            <p className="text-slate-600 mb-6 text-sm sm:text-base px-4">
              Add job applications to see your timeline here
            </p>
            <button
              onClick={() => setIsAddFormOpen(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              Add Your First Application
            </button>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-3 sm:p-6">
            <div className="relative">
              {/* Responsive Timeline line - Hidden on mobile, visible on larger screens */}
              <div className="hidden sm:block absolute left-6 lg:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-blue-500"></div>
              
              <div className="space-y-4 sm:space-y-8">
                {Object.entries(groupedEvents).map(([dateKey, dayEvents], dayIndex) => (
                  <div key={dateKey} className="relative">
                    {/* Responsive Date header */}
                    <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-4">
                      {/* Desktop Timeline Dot */}
                      <div className="hidden sm:block relative z-10 bg-white border-4 border-blue-500 rounded-full p-1.5 lg:p-2 mr-4 lg:mr-6">
                        <Calendar className="h-3 w-3 lg:h-4 lg:w-4 text-blue-600" />
                      </div>
                      
                      {/* Date Header */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg px-3 sm:px-4 py-2 border border-blue-200">
                        <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                          {new Date(dateKey).toLocaleDateString('en-US', {
                            weekday: window.innerWidth < 640 ? 'short' : 'long',
                            year: 'numeric',
                            month: window.innerWidth < 640 ? 'short' : 'long',
                            day: 'numeric'
                          })}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600">{dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    {/* Responsive Events for this day */}
                    <div className="sm:ml-12 lg:ml-16 space-y-3 sm:space-y-4">
                      {dayEvents.map((event, eventIndex) => (
                        <div key={event.id} className="relative">
                          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                            <div 
                              className="p-3 sm:p-6 cursor-pointer"
                              onClick={() => toggleEventExpansion(event.id)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-2 sm:space-x-4 flex-1 min-w-0">
                                  <div className={`rounded-full p-2 sm:p-3 text-white flex-shrink-0 ${getEventColor(event.type)}`}>
                                    {getEventIcon(event.type)}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                                      <h4 className="font-semibold text-slate-900 text-sm sm:text-base truncate">{event.title}</h4>
                                      <span className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full border w-fit ${getStatusBadgeColor(event.status)}`}>
                                        {event.status}
                                      </span>
                                    </div>
                                    
                                    <p className="text-slate-600 mb-2 text-sm truncate">{event.company}</p>
                                    
                                    <div className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-slate-500 space-y-1 sm:space-y-0 sm:space-x-4">
                                      <span className="flex items-center space-x-1">
                                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                        <span>{event.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                      </span>
                                      <span className="flex items-center space-x-1">
                                        <Building className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                        <span className="truncate">{event.job.title}</span>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 ml-2">
                                  {event.job.applicationLink && (
                                    <a
                                      href={event.job.applicationLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-700 transition-colors p-1"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </a>
                                  )}
                                  {expandedEvents.has(event.id) ? (
                                    <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Enhanced Responsive Expanded content */}
                            {expandedEvents.has(event.id) && (
                              <div className="border-t border-slate-200 bg-slate-50/50 p-3 sm:p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                  <div>
                                    <h5 className="font-medium text-slate-900 mb-2 text-sm sm:text-base">Event Details</h5>
                                    <p className="text-slate-600 text-xs sm:text-sm mb-3 sm:mb-4">{event.description}</p>
                                    
                                    <div className="space-y-2 text-xs sm:text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Position:</span>
                                        <span className="font-medium text-slate-900 text-right max-w-[60%] truncate">{event.job.title}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Company:</span>
                                        <span className="font-medium text-slate-900 text-right max-w-[60%] truncate">{event.job.company}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Status:</span>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(event.job.status)}`}>
                                          {event.job.status}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h5 className="font-medium text-slate-900 mb-2 text-sm sm:text-base">Timeline</h5>
                                    <div className="space-y-2 text-xs sm:text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Applied:</span>
                                        <span className="text-slate-900">
                                          {new Date(event.job.dateApplied).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: '2-digit'
                                          })}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Last Updated:</span>
                                        <span className="text-slate-900">
                                          {new Date(event.job.updatedAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: '2-digit'
                                          })}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Job Form Modal */}
        <AddJobForm
          isOpen={isAddFormOpen}
          onClose={() => setIsAddFormOpen(false)}
          onJobAdded={fetchJobs}
          editJob={null}
        />
      </div>
    </div>
  );
}