import React, { useEffect, useMemo } from 'react';
import { motion, animate, useMotionValue, useTransform } from 'framer-motion';
import TiltCard from './TiltCard';
import RingProgress from './RingProgress';
import DonutChart from './DonutChart';
import { Zap, CheckCircle, Clock } from 'lucide-react';

const AnimatedCounter = ({ value, className = '' }) => {
    const count = useMotionValue(0);
    const rounded = useTransform(count, Math.round);

    useEffect(() => {
        const animation = animate(count, value, { duration: 1.2, ease: "circOut" });
        return animation.stop;
    }, [value]);

    return <motion.span className={className}>{rounded}</motion.span>;
};

const ThreeDDashboard = ({
    stats = { percentage: 0, completed: 0, pending: 0 },
    subjects = [],
    subjectProgress = [],
    setIsSubjectModalOpen,
    setSelectedSubjectId
}) => {

    const donutData = useMemo(() => {
        return subjectProgress.slice(0, 6).map((sub) => ({
            name: sub.name,
            value: sub.tasksLeft + (sub.percent > 0 ? Math.round(sub.tasksLeft * sub.percent / (100 - sub.percent)) : 0),
            hours: Math.round((sub.percent / 100) * 20)
        }));
    }, [subjectProgress]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full w-full overflow-y-auto font-sans text-gray-800"
        >
            <div className="max-w-5xl mx-auto p-8">

                {/* HEADER */}
                <header className="mb-10 flex items-end justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Dashboard</h1>
                        <p className="text-gray-400 text-sm mt-1">Performance Overview</p>
                    </div>
                    <div className="text-sm text-gray-400">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                </header>

                {/* MAIN GRID - Two Cards Only */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

                    {/* EFFICIENCY CARD */}
                    <TiltCard tiltEnabled={true} className="flex flex-col items-center justify-center min-h-[360px]">
                        {/* Ring Progress */}
                        <div className="relative mb-6">
                            <RingProgress value={stats.percentage} size={200} strokeWidth={14} />

                            {/* Center Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-bold text-gray-900">
                                    <AnimatedCounter value={stats.percentage} />%
                                </span>
                                <span className="text-xs text-gray-400 uppercase tracking-widest mt-2">Efficiency</span>
                            </div>
                        </div>

                        {/* Stats Row - Centered, No Delta */}
                        <div className="flex gap-12 pt-6 border-t border-gray-100 justify-center">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <CheckCircle size={16} className="text-emerald-500" />
                                    <span className="text-2xl font-semibold text-gray-900">
                                        <AnimatedCounter value={stats.completed} />
                                    </span>
                                </div>
                                <div className="text-xs text-gray-400 uppercase tracking-wider">Completed</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <Clock size={16} className="text-amber-500" />
                                    <span className="text-2xl font-semibold text-gray-900">
                                        <AnimatedCounter value={stats.pending} />
                                    </span>
                                </div>
                                <div className="text-xs text-gray-400 uppercase tracking-wider">Pending</div>
                            </div>
                        </div>
                    </TiltCard>

                    {/* TASK DISTRIBUTION - Larger */}
                    <TiltCard className="flex flex-col min-h-[360px]">
                        <h3 className="text-sm text-gray-400 uppercase tracking-widest mb-6 text-center">Task Distribution</h3>

                        <div className="flex-1 flex items-center justify-center gap-8">
                            {donutData.length > 0 ? (
                                <>
                                    <DonutChart data={donutData} size={180} strokeWidth={22} />

                                    {/* Legend - Vertical */}
                                    <div className="flex flex-col gap-3">
                                        {donutData.slice(0, 5).map((item, index) => (
                                            <div key={item.name} className="flex items-center gap-2 text-sm">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{
                                                        backgroundColor: ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'][index % 5]
                                                    }}
                                                />
                                                <span className="text-gray-600 truncate max-w-[100px]">{item.name}</span>
                                                <span className="text-gray-400 text-xs">{item.hours}h</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-gray-300">
                                    <div className="w-40 h-40 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center">
                                        <span className="text-sm text-gray-400">No Data</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </TiltCard>
                </div>

                {/* ACTIVE MODULES */}
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <Zap size={18} className="text-violet-500" />
                            <h2 className="text-lg font-semibold text-gray-900">Active Modules</h2>
                        </div>
                        <button
                            onClick={() => setIsSubjectModalOpen(true)}
                            className="text-sm text-violet-600 hover:text-violet-700 transition-colors font-medium flex items-center gap-1 px-4 py-2 rounded-xl hover:bg-violet-50"
                        >
                            + Add Module
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subjects.length === 0 ? (
                            <div className="col-span-full py-16 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 bg-white/50">
                                <Zap size={28} className="mb-3 text-gray-300" />
                                <p className="text-sm font-medium">No active modules</p>
                                <p className="text-xs mt-1 text-gray-300">Create a subject to begin tracking</p>
                            </div>
                        ) : (
                            subjectProgress.map((sub, index) => (
                                <TiltCard
                                    key={sub.id}
                                    onClick={() => setSelectedSubjectId(sub.id)}
                                    className="cursor-pointer group !p-5"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-3 h-3 rounded-full ${sub.color.replace('bg-gradient-to-br', 'bg')}`}></div>
                                        <span className="text-xl font-bold text-gray-900 group-hover:text-violet-600 transition-colors">{sub.percent}%</span>
                                    </div>

                                    <h3 className="font-medium text-gray-900 mb-3 truncate">{sub.name}</h3>

                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                                        <motion.div
                                            className={`h-full ${sub.color.replace('bg-gradient-to-br', 'bg')} rounded-full`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${sub.percent}%` }}
                                            transition={{ duration: 0.6, delay: index * 0.1 }}
                                        />
                                    </div>

                                    <div className="text-xs text-gray-400">{sub.tasksLeft} tasks remaining</div>
                                </TiltCard>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ThreeDDashboard;
