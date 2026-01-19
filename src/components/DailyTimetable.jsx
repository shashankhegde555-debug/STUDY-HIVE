import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    BookOpen,
    Coffee,
    Dumbbell,
    Moon,
    Sun,
    Utensils,
    Laptop,
    Music,
    Gamepad2,
    Briefcase,
    GraduationCap,
    Plus,
    Trash2,
    RefreshCw,
    Sparkles
} from 'lucide-react';

// Icon mapping based on keywords
const getActivityIcon = (title) => {
    const lower = title.toLowerCase();
    if (lower.includes('study') || lower.includes('read') || lower.includes('learn')) return BookOpen;
    if (lower.includes('break') || lower.includes('coffee') || lower.includes('tea')) return Coffee;
    if (lower.includes('gym') || lower.includes('exercise') || lower.includes('workout') || lower.includes('run')) return Dumbbell;
    if (lower.includes('sleep') || lower.includes('bed') || lower.includes('rest')) return Moon;
    if (lower.includes('wake') || lower.includes('morning')) return Sun;
    if (lower.includes('lunch') || lower.includes('dinner') || lower.includes('breakfast') || lower.includes('eat') || lower.includes('food')) return Utensils;
    if (lower.includes('code') || lower.includes('programming') || lower.includes('work') || lower.includes('laptop')) return Laptop;
    if (lower.includes('music') || lower.includes('listen')) return Music;
    if (lower.includes('game') || lower.includes('play')) return Gamepad2;
    if (lower.includes('meeting') || lower.includes('office') || lower.includes('job')) return Briefcase;
    if (lower.includes('class') || lower.includes('lecture') || lower.includes('school')) return GraduationCap;
    return Clock;
};

// Status determination based on time
const getStatus = (time, isCompleted) => {
    if (isCompleted) return 'completed';

    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const taskTime = new Date();
    taskTime.setHours(hours, minutes, 0, 0);

    const diffMinutes = (taskTime - now) / (1000 * 60);

    if (diffMinutes < -30) return 'overdue';
    if (diffMinutes <= 30 && diffMinutes >= -30) return 'in-progress';
    return 'upcoming';
};

const StatusPill = ({ status }) => {
    const styles = {
        'completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'in-progress': 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse',
        'upcoming': 'bg-gray-100 text-gray-500 border-gray-200',
        'overdue': 'bg-amber-100 text-amber-700 border-amber-200'
    };

    const labels = {
        'completed': 'Completed',
        'in-progress': 'In Progress',
        'upcoming': 'Upcoming',
        'overdue': 'Missed'
    };

    return (
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${styles[status]}`}>
            {labels[status]}
        </span>
    );
};

const DailyTimetable = ({ routine, setRoutine }) => {
    const [newTask, setNewTask] = useState({ time: '', title: '' });
    const [quote, setQuote] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isFormFocused, setIsFormFocused] = useState(false);

    useEffect(() => {
        const quotes = [
            "Small steps every day.",
            "Focus on the process.",
            "You got this!",
            "Consistency is key.",
            "Make today count."
        ];
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

        // Update current time every minute
        const interval = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    // Find next upcoming task
    const nextUp = useMemo(() => {
        const now = new Date();
        return routine
            .filter(item => !item.completed)
            .find(item => {
                const [h, m] = item.time.split(':').map(Number);
                const taskTime = new Date();
                taskTime.setHours(h, m, 0, 0);
                return taskTime > now;
            });
    }, [routine, currentTime]);

    const addRoutineItem = (e) => {
        e.preventDefault();
        if (!newTask.time || !newTask.title) return;
        const newItem = { ...newTask, id: Math.random().toString(36).substr(2, 9), completed: false };
        setRoutine(prev => [...prev, newItem].sort((a, b) => a.time.localeCompare(b.time)));
        setNewTask({ time: '', title: '' });
    };

    const toggleRoutineItem = (id) => {
        setRoutine(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
    };

    const deleteRoutineItem = (id) => {
        setRoutine(prev => prev.filter(item => item.id !== id));
    };

    const resetDaily = () => {
        if (confirm("Reset all daily tasks for a fresh start?")) {
            setRoutine(prev => prev.map(item => ({ ...item, completed: false })));
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-6 mb-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <div className="bg-violet-100 p-2 rounded-xl text-violet-600">
                            <Clock size={20} />
                        </div>
                        Daily Timetable
                    </h2>
                    <p className="text-gray-400 text-xs mt-1 italic ml-1">"{quote}"</p>
                </div>
                <button
                    onClick={resetDaily}
                    className="text-gray-400 hover:text-violet-600 transition-colors p-2 bg-gray-50 hover:bg-violet-50 rounded-xl"
                    title="Reset Day"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Next Up Widget */}
            {nextUp && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-4 mb-6 text-white"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <Sparkles size={18} />
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-white/70 uppercase tracking-wider mb-0.5">Next Up</div>
                            <div className="font-semibold">{nextUp.title}</div>
                        </div>
                        <div className="text-2xl font-bold">{nextUp.time}</div>
                    </div>
                </motion.div>
            )}

            {/* Add Form - Ultra Minimalist */}
            <form onSubmit={addRoutineItem} className="mb-6">
                <div className={`flex gap-3 p-3 rounded-2xl border-2 transition-all duration-300 ${isFormFocused ? 'border-violet-200 bg-violet-50/50' : 'border-transparent bg-gray-50'}`}>
                    <input
                        type="time"
                        required
                        className="bg-transparent border-b-2 border-gray-200 focus:border-violet-400 px-2 py-2 text-sm font-semibold text-gray-700 outline-none transition-colors w-24"
                        value={newTask.time}
                        onChange={e => setNewTask({ ...newTask, time: e.target.value })}
                        onFocus={() => setIsFormFocused(true)}
                        onBlur={() => setIsFormFocused(false)}
                    />
                    <input
                        type="text"
                        required
                        placeholder="Activity (e.g. Study Math, Coffee Break)"
                        className="flex-1 bg-transparent border-b-2 border-gray-200 focus:border-violet-400 px-2 py-2 text-sm outline-none transition-colors placeholder:text-gray-300"
                        value={newTask.title}
                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                        onFocus={() => setIsFormFocused(true)}
                        onBlur={() => setIsFormFocused(false)}
                    />
                    <button
                        type="submit"
                        className="bg-violet-500 text-white p-2.5 rounded-xl hover:bg-violet-600 transition-all shadow-lg shadow-violet-500/30"
                    >
                        <Plus size={18} />
                    </button>
                </div>
            </form>

            {/* Timeline */}
            <div className="relative max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {/* Current Time Indicator */}
                <div
                    className="absolute left-8 w-[calc(100%-2rem)] h-0.5 bg-gradient-to-r from-violet-500 to-purple-500 z-10 rounded-full"
                    style={{
                        top: `${Math.min(Math.max((currentTime.getHours() * 60 + currentTime.getMinutes()) / (24 * 60) * 100, 0), 100)}%`
                    }}
                >
                    <div className="absolute -left-1 -top-1 w-3 h-3 bg-violet-500 rounded-full animate-pulse shadow-lg shadow-violet-500/50"></div>
                </div>

                {routine.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                        <Clock size={32} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-sm font-medium">Your day is empty</p>
                        <p className="text-xs text-gray-300 mt-1">Add activities to build your routine</p>
                    </div>
                ) : (
                    <div className="space-y-3 relative">
                        {/* Vertical Timeline Line */}
                        <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-gray-100 rounded-full"></div>

                        <AnimatePresence>
                            {routine.map((item, index) => {
                                const status = getStatus(item.time, item.completed);
                                const IconComponent = getActivityIcon(item.title);

                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`relative flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 ml-6 ${status === 'completed'
                                                ? 'bg-gray-50 opacity-60'
                                                : status === 'in-progress'
                                                    ? 'bg-blue-50/50 border border-blue-100'
                                                    : 'bg-white/60 backdrop-blur-sm border border-gray-100 hover:shadow-lg hover:border-violet-100'
                                            }`}
                                    >
                                        {/* Timeline Dot */}
                                        <div
                                            className={`absolute -left-[22px] top-6 w-4 h-4 rounded-full border-2 ${status === 'completed'
                                                    ? 'bg-emerald-500 border-emerald-500'
                                                    : status === 'in-progress'
                                                        ? 'bg-blue-500 border-blue-500 animate-pulse'
                                                        : 'bg-white border-gray-300'
                                                }`}
                                        />

                                        {/* Icon */}
                                        <div className={`shrink-0 p-2 rounded-xl ${status === 'completed'
                                                ? 'bg-gray-100 text-gray-400'
                                                : status === 'in-progress'
                                                    ? 'bg-blue-100 text-blue-600'
                                                    : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            <IconComponent size={18} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-mono text-xs text-gray-400">{item.time}</span>
                                                <StatusPill status={status} />
                                            </div>
                                            <div className={`font-medium truncate ${status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                                {item.title}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => toggleRoutineItem(item.id)}
                                                className={`p-2 rounded-lg transition-all ${status === 'completed'
                                                        ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                                                        : 'bg-gray-100 text-gray-400 hover:bg-emerald-100 hover:text-emerald-600'
                                                    }`}
                                            >
                                                ✓
                                            </button>
                                            <button
                                                onClick={() => deleteRoutineItem(item.id)}
                                                className="p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyTimetable;
