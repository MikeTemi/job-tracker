'use client';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Job, JobStatus } from '@/types/job';

interface JobChartsProps {
  jobs: Job[];
}

export default function JobCharts({ jobs }: JobChartsProps) {
    //Status distribution data for pie chart
    const statusData = [
        {
            name: 'Applied',
            value: jobs.filter(job => job.status === JobStatus.APPLIED).length,
            color: '#3B82F6'
        },
        {
            name: 'Interviewing',
            value: jobs.filter(job => job.status === JobStatus.INTERVIEWING).length,
            color: '#F59E0B'
        },
        {
            name: 'Offer',
            value: jobs.filter(job => job.status === JobStatus.OFFER).length,
            color: '#10B981'
        },
        {
            name: 'Rejected',
            value: jobs.filter(job => job.status === JobStatus.REJECTED).length,
            color: '#EF4444'
        }
    ].filter(item => item.value > 0); // Only show the statuses that have jobs

    // Company distribution data for bar chart
    const companyData = jobs.reduce((acc, job) => {
        const existing = acc.find(item => item.company === job.company);
        if (existing) {
            existing.applications += 1;
        } else {
            acc.push({
                company: job.company,
                applications: 1
            });
        }
        return acc;
    }, [] as Array<{ company: string; applications: number }>).sort((a, b) => b.applications - a.applications).slice(0, 5); // Shows top 5 companies

    //Timeline data for line chart (applications per day)
    const timelineData = jobs.reduce((acc, job) => {
        const date = job.dateApplied ? new Date(job.dateApplied).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        }) : 'Unknown';

        const existing = acc.find(item => item.date === date);
        if (existing) {
            existing.applications += 1;
        } else {
            acc.push({
                date,
                applications: 1,
                fullDate: job.dateApplied ? new Date(job.dateApplied) : new Date()
            });
        }
        return acc;
    }, [] as Array<{ date: string; applications: number; fullDate: Date }>)
    .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime())
    .slice(-7); //Last 7 data points

    const CustomTooltip = ({ active, payload, label }: any) => {
        if  (active && payload && payload.length) {
            return (
               <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900">{label}</p>
                    <p className="text-blue-600">
                        {`Applications: ${payload[0].value}`}
                    </p>
                </div> 
            );
        }
        return null;
    };
    
    if (jobs.length === 0) {
        return (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 text-center">
                <p className="text-slate-600">Add some job applications to see beautiful charts!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {/* Status Distribution Pie Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Application Status</h3>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    >
                    {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </div>

        {/* Company Applications Bar Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Companies</h3>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={companyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis 
                    dataKey="company" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="applications" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>

        {/* Application Timeline */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 lg:col-span-2 xl:col-span-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Application Timeline</h3>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                    type="monotone" 
                    dataKey="applications" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, fill: '#8B5CF6' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
        </div>
    );
}