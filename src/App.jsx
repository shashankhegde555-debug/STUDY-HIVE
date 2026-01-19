import React, { useState, useEffect, useMemo, useRef } from 'react';
import ThreeDDashboard from './components/ThreeDDashboard';
import DailyTimetable from './components/DailyTimetable';
import {
  BookOpen,
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  Plus,
  Trash2,
  BarChart3,
  Layout,
  List,
  Bell,
  X,
  FileText,
  Upload,
  Brain,
  Sparkles,
  ChevronRight,
  Loader2,
  PenTool,
  Bookmark,
  Zap,
  Target,
  Coffee,
  Maximize2,
  Send,
  HelpCircle,
  Lightbulb,
  RefreshCw,
  Crown, // Premium Icon
  ZoomIn,
  ZoomOut,
  Download,
  Move,
  RotateCcw as ResetIcon,
  Check
} from 'lucide-react';

// --- CONFIGURATION ---
// API key is loaded from environment variables (.env file)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// --- API & HELPERS ---
const callGemini = async (prompt, fileData = null) => {
  const apiKey = GEMINI_API_KEY || "";

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const parts = [{ text: prompt }];

  if (fileData) {
    const base64Data = fileData.data.split(',')[1] || fileData.data;
    parts.push({ inlineData: { mimeType: fileData.mimeType, data: base64Data } });
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] })
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Error connecting to Gemini. Please check your API key.";
  }
};

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };
  return [storedValue, setValue];
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const COLORS = [
  { name: 'Ocean', value: 'bg-gradient-to-br from-cyan-400 to-blue-600' },
  { name: 'Emerald', value: 'bg-gradient-to-br from-emerald-400 to-green-600' },
  { name: 'Berry', value: 'bg-gradient-to-br from-pink-500 to-rose-600' },
  { name: 'Sunset', value: 'bg-gradient-to-br from-orange-400 to-red-500' },
  { name: 'Lavender', value: 'bg-gradient-to-br from-violet-400 to-purple-600' },
  { name: 'Midnight', value: 'bg-gradient-to-br from-indigo-500 to-slate-800' },
];

// --- SUB-COMPONENTS ---

// Custom Markdown Renderer
const SimpleMarkdown = ({ content }) => {
  if (!content) return null;

  const processText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-3 text-slate-700 leading-relaxed text-sm">
      {content.split('\n').map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={index} className="h-2"></div>;

        if (trimmed.startsWith('###') || trimmed.startsWith('##')) {
          return <h3 key={index} className="text-lg font-bold text-indigo-800 mt-5 mb-2">{processText(trimmed.replace(/^#+\s*/, ''))}</h3>;
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={index} className="flex gap-2 ml-2 mb-1">
              <span className="text-indigo-500 font-bold mt-1">•</span>
              <span>{processText(trimmed.substring(2))}</span>
            </div>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <div key={index} className="flex gap-2 ml-2 mb-1">
              <span className="text-indigo-500 font-bold mt-0.5">{trimmed.split('.')[0]}.</span>
              <span>{processText(trimmed.replace(/^\d+\.\s/, ''))}</span>
            </div>
          );
        }
        return <p key={index} className="mb-2">{processText(trimmed)}</p>;
      })}
    </div>
  );
};

// DailyTimetable is now imported from ./components/DailyTimetable.jsx

// PREMIUM PRO VIEW (FLOWCHART GENERATOR) - React Flow Version
const ProView = () => {
  const [proFlowcharts, setProFlowcharts] = useLocalStorage('study-pro-flowcharts-v2', []);
  const [currentChart, setCurrentChart] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const fileInputRef = useRef(null);

  // Dynamic import for FlowchartCanvas
  const FlowchartCanvas = React.lazy(() => import('./components/FlowchartCanvas'));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadFile({ data: reader.result, mimeType: file.type, name: file.name });
      reader.readAsDataURL(file);
    }
  };

  const generateFlowchart = async () => {
    if (!uploadFile) return;
    setIsGenerating(true);

    const prompt = `
Extract a CONCISE flowchart for brainstorming. Be BRIEF.

Return ONLY valid JSON:
{
  "nodes": [
    { "id": "1", "type": "start", "label": "Start" },
    { "id": "2", "type": "process", "label": "Do X" },
    { "id": "3", "type": "decision", "label": "Check?" },
    { "id": "4", "type": "end", "label": "Done" }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2" },
    { "id": "e2-3", "source": "2", "target": "3" },
    { "id": "e3-4", "source": "3", "target": "4" }
  ]
}

CRITICAL RULES:
- Labels: MAX 2-4 words (e.g., "Read Input", "Validate Data", "Save File")
- Keep it SHORT: max 8-12 nodes for complex docs
- Types: "start", "end", "process", "decision"
- NO details, NO sources - just the core flow
- Focus on KEY steps only, skip minor details

Return ONLY JSON, no markdown.
    `;

    try {
      const response = await callGemini(prompt, uploadFile);

      // Clean and parse response
      let cleaned = response.trim().replace(/```json\s*/gi, '').replace(/```\s*/g, '');
      const data = JSON.parse(cleaned);

      if (data.nodes && data.edges) {
        const newChart = {
          id: generateId(),
          name: `Flowchart - ${uploadFile.name}`,
          date: new Date().toLocaleDateString(),
          data: data // Store JSON instead of SVG
        };
        setProFlowcharts([newChart, ...proFlowcharts]);
        setCurrentChart(newChart);
      } else {
        alert("Failed to parse flowchart. Please try again.");
      }
    } catch (error) {
      console.error("Flowchart generation error:", error);
      alert("Failed to generate flowchart. The AI response was not valid JSON.");
    }

    setIsGenerating(false);
  };

  const deleteChart = (chartId) => {
    setProFlowcharts(proFlowcharts.filter(c => c.id !== chartId));
    if (currentChart?.id === chartId) setCurrentChart(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="bg-gradient-to-r from-violet-500 to-purple-600 text-transparent bg-clip-text">PRO</span> Workspace
            <Crown className="text-amber-500" size={24} />
          </h2>
          <p className="text-gray-400 text-sm">AI-Powered Visual Thinking</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 h-[650px]">
        {/* Sidebar List */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-xl overflow-hidden flex flex-col">
          <div className="p-4 bg-gray-50 border-b border-gray-100 font-semibold text-gray-600 text-sm">Saved Flowcharts</div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {proFlowcharts.length === 0 && <p className="text-center text-gray-400 text-sm py-10">No flowcharts yet.</p>}
            {proFlowcharts.map(chart => (
              <div
                key={chart.id}
                onClick={() => setCurrentChart(chart)}
                className={`p-3 rounded-xl cursor-pointer transition-all border group ${currentChart?.id === chart.id ? 'bg-violet-50 border-violet-200 shadow-sm' : 'hover:bg-gray-50 border-transparent hover:border-gray-100'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-700 text-sm truncate">{chart.name}</div>
                    <div className="text-xs text-gray-400">{chart.date}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteChart(chart.id); }}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-500 p-1 rounded transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => { setCurrentChart(null); setUploadFile(null); }}
              className="w-full bg-violet-500 text-white py-3 rounded-xl font-semibold text-sm hover:bg-violet-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-violet-500/30"
            >
              <Plus size={16} /> New Project
            </button>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="lg:col-span-3 bg-white/50 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-xl relative overflow-hidden flex flex-col">
          {!currentChart ? (
            // Upload State
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 cursor-pointer hover:scale-[1.02] transition-transform border border-gray-100 group"
              >
                <input type="file" accept="image/*,application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-violet-200 transition-shadow">
                  {isGenerating ? <Loader2 className="animate-spin text-white" size={32} /> : <Upload className="text-white" size={32} />}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {isGenerating ? 'Generating Flowchart...' : 'Upload Notes / PDF'}
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  {uploadFile ? uploadFile.name : 'AI will analyze and visualize your process with interactive nodes.'}
                </p>

                {uploadFile && !isGenerating && (
                  <button
                    onClick={(e) => { e.stopPropagation(); generateFlowchart(); }}
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-violet-600 hover:to-purple-700 transition-colors shadow-lg"
                  >
                    ✨ Generate Interactive Flowchart
                  </button>
                )}
              </div>
            </div>
          ) : (
            // React Flow Canvas
            <React.Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-violet-500" size={32} /></div>}>
              <FlowchartCanvas flowchartData={currentChart.data} className="flex-1" />
            </React.Suspense>
          )}
        </div>
      </div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children, size = 'max-w-md' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${size} overflow-hidden flex flex-col max-h-[90vh] border border-slate-100`}>
        <div className="flex justify-between items-center p-5 border-b border-slate-100 shrink-0 bg-slate-50/50">
          <h3 className="font-extrabold text-xl text-slate-800 tracking-tight">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors p-1 hover:bg-rose-50 rounded-full"><X size={20} /></button>
        </div>
        <div className="p-0 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

const ProgressBar = ({ percent, colorClass }) => (
  <div className="w-full bg-slate-100 rounded-full h-3 mt-3 shadow-inner overflow-hidden">
    <div className={`${colorClass} h-full rounded-full transition-all duration-700 ease-out shadow-sm`} style={{ width: `${percent}%` }}></div>
  </div>
);

const TaskCard = ({ task, subjects, toggleTask, updateTaskProgress, deleteTask, showSubject = true }) => {
  const safeSubjects = Array.isArray(subjects) ? subjects : [];
  const subject = safeSubjects.find(s => s.id === task.subjectId);
  const todayStr = new Date().toISOString().split('T')[0];

  const Content = () => (
    <>
      <div className="flex items-center gap-4 overflow-hidden">
        <button
          onClick={() => toggleTask(task.id)}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white scale-110' : 'border-slate-300 text-transparent hover:border-emerald-400'}`}
        >
          <CheckCircle size={14} strokeWidth={3} />
        </button>
        <div className="min-w-0">
          <p className={`font-bold text-base truncate ${task.completed ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-800'}`}>
            {task.title}
          </p>
          <div className="flex items-center text-xs text-slate-500 gap-3 mt-1">
            {showSubject && subject && <span className={`px-2 py-0.5 rounded-full text-white ${subject.color} text-[10px] font-bold shadow-sm`}>{subject.name}</span>}
            <span className="flex items-center gap-1"><CalendarIcon size={12} /> {task.dueDate}</span>
            {!task.completed && task.dueDate === todayStr && <span className="text-orange-500 flex items-center gap-1 font-bold animate-pulse bg-orange-50 px-2 py-0.5 rounded-full"><Bell size={10} /> Due Today</span>}
            {task.isReading && <span className="flex items-center gap-1 text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full"><Bookmark size={10} /> {task.progress}/{task.total} pgs</span>}
          </div>
        </div>
      </div>
      <button onClick={() => deleteTask(task.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-2 hover:bg-rose-50 rounded-full"><Trash2 size={18} /></button>
    </>
  );

  if (task.isReading) {
    return (
      <div className={`group p-4 mb-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${task.completed ? 'bg-emerald-50/50 border-emerald-100' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <Content />
        </div>
        <div className="flex items-center gap-3 pl-10 pr-2">
          <input
            type="range"
            min="0"
            max={task.total}
            value={task.progress}
            onChange={(e) => updateTaskProgress(task.id, e.target.value)}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`group flex items-center justify-between p-4 mb-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${task.completed ? 'opacity-60 bg-slate-50' : ''}`}>
      <Content />
    </div>
  );
};

const SubjectDetailModal = ({
  subject,
  subjects,
  onClose,
  tasks,
  aiNotes,
  setAiNotes,
  subjectMaterials,
  setSubjectMaterials,
  setIsTaskModalOpen,
  setNewTask,
  toggleTask,
  updateTaskProgress,
  deleteTask
}) => {
  const [detailTab, setDetailTab] = useState('tasks');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [manualNoteContent, setManualNoteContent] = useState("");
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  if (!subject) return null;

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeAiNotes = Array.isArray(aiNotes) ? aiNotes : [];
  const safeMaterials = subjectMaterials || {};

  const subjectTasks = safeTasks.filter(t => t.subjectId === subject.id);
  const subjectNotes = safeAiNotes.filter(n => n.subjectId === subject.id);
  const material = safeMaterials[subject.id];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        const newMaterial = {
          data: reader.result,
          mimeType: isPdf ? 'application/pdf' : file.type,
          name: file.name
        };
        // Safe update for materials
        setSubjectMaterials(prev => ({
          ...(prev || {}),
          [subject.id]: newMaterial
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGeminiAction = async (actionType, customText = "") => {
    if (!material) return;
    setIsAnalyzing(true);
    setAiResponse("");

    const fileType = material.mimeType === 'application/pdf' ? "PDF document" : "image";
    let finalPrompt = "";
    const formatInstruction = "Output ONLY clear Markdown. Use bold (**text**) for important terms, ### Headers for sections, and bullet points (- item) for lists. Do NOT use code blocks.";

    if (actionType === 'custom') {
      finalPrompt = `You are an expert tutor. Answer this question about the ${fileType}: "${customText}". ${formatInstruction}`;
    }
    else if (actionType === 'summary') {
      finalPrompt = `Analyze this ${fileType}. Provide a structured summary with sections: ### Executive Summary, ### Key Concepts, ### Detailed Breakdown, ### Takeaways. ${formatInstruction}`;
    }
    else if (actionType === 'quiz') {
      finalPrompt = `Generate a 5-question multiple choice quiz. Format: Question, Options. At the bottom: ### Answer Key with explanations. ${formatInstruction}`;
    }
    else if (actionType === 'explain') {
      finalPrompt = `Explain this ${fileType} using the Feynman Technique. Sections: ### Simple Explanation, ### Analogy, ### Step-by-Step, ### Why It Matters. ${formatInstruction}`;
    }

    const result = await callGemini(finalPrompt, material);
    setAiResponse(result);
    setIsAnalyzing(false);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    handleGeminiAction('custom', aiPrompt);
    setAiPrompt("");
  };

  const saveNote = () => {
    if (!aiResponse) return;
    setAiNotes([{ id: generateId(), subjectId: subject.id, content: aiResponse, date: new Date().toLocaleDateString(), type: 'ai-generated' }, ...safeAiNotes]);
    setAiResponse("");
    setDetailTab('notes');
  };

  const saveManualNote = () => {
    if (!manualNoteContent.trim()) return;
    setAiNotes([{ id: generateId(), subjectId: subject.id, content: manualNoteContent, date: new Date().toLocaleDateString(), type: 'manual' }, ...safeAiNotes]);
    setManualNoteContent("");
  };

  const removeMaterial = () => {
    setSubjectMaterials(prev => {
      const updated = { ...(prev || {}) };
      delete updated[subject.id];
      return updated;
    });
    setAiResponse("");
  };

  return (
    <Modal isOpen={!!subject} onClose={onClose} title={subject.name} size="max-w-5xl">
      <div className="flex gap-2 mb-6 border-b border-slate-100 pb-4">
        <button onClick={() => setDetailTab('tasks')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all capitalize ${detailTab === 'tasks' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>Tasks</button>
        <button onClick={() => setDetailTab('materials')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all capitalize ${detailTab === 'materials' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
          <span className="flex items-center gap-2"><Brain size={16} /> Materials & AI</span>
        </button>
        <button onClick={() => setDetailTab('notes')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all capitalize ${detailTab === 'notes' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>Notes</button>
      </div>

      <div className="p-1 min-h-[400px]">
        {detailTab === 'tasks' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-slate-700 flex items-center gap-2"><List size={18} /> Subject Tasks</h4>
              <button onClick={() => { setIsTaskModalOpen(true); setNewTask(prev => ({ ...prev, subjectId: subject.id })); }} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-1"><Plus size={14} /> New Task</button>
            </div>
            {subjectTasks.length === 0 ? <p className="text-slate-400 text-sm text-center py-12">No tasks yet.</p> : subjectTasks.map(task => (
              <TaskCard key={task.id} task={task} subjects={subjects} toggleTask={toggleTask} updateTaskProgress={updateTaskProgress} deleteTask={deleteTask} showSubject={false} />
            ))}
          </div>
        )}

        {detailTab === 'materials' && (
          <div className="grid lg:grid-cols-2 gap-6 h-[550px]">
            <div className="h-full flex flex-col">
              {!material ? (
                <div onClick={() => fileInputRef.current?.click()} className="h-full border-2 border-dashed border-indigo-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition-all group">
                  <input type="file" accept="image/*,application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                  <div className="w-20 h-20 bg-white text-indigo-400 rounded-full flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform"><Upload size={32} /></div>
                  <p className="text-lg font-bold text-slate-600">Upload PDF / Image</p>
                  <p className="text-sm text-slate-400 mt-2">to unlock AI features</p>
                </div>
              ) : (
                <div className="h-full rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-slate-900 relative group">
                  <div className="absolute top-0 left-0 right-0 bg-slate-900/90 backdrop-blur text-white p-3 text-xs flex justify-between items-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="truncate px-2 font-mono">{material.name}</span>
                    <button onClick={removeMaterial} className="hover:bg-rose-500 p-1.5 rounded transition-colors"><Trash2 size={14} /></button>
                  </div>
                  {material.mimeType === 'application/pdf' ? (
                    <iframe src={material.data} className="w-full h-full bg-slate-50" title="Material PDF" />
                  ) : (
                    <img src={material.data} alt="Material" className="w-full h-full object-contain bg-slate-900" />
                  )}
                </div>
              )}
            </div>

            <div className="h-full flex flex-col bg-slate-50 rounded-2xl border border-slate-200 shadow-inner overflow-hidden">
              <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-2 shadow-sm">
                <Sparkles className="text-indigo-600 fill-indigo-100" size={20} />
                <h4 className="font-bold text-slate-800">Study Assistant</h4>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {!material ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Brain size={48} className="text-slate-200" />
                    <p className="text-sm">Upload a document to start.</p>
                  </div>
                ) : (
                  <>
                    {!aiResponse && !isAnalyzing && (
                      <div className="grid grid-cols-1 gap-3 mt-4">
                        <button onClick={() => handleGeminiAction('summary')} className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all text-left group">
                          <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><FileText size={20} /></div>
                          <div><div className="font-bold text-slate-700 text-sm">Summarize Document</div><div className="text-xs text-slate-400">Key concepts & definitions</div></div>
                        </button>
                        <button onClick={() => handleGeminiAction('explain')} className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all text-left group">
                          <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors"><Lightbulb size={20} /></div>
                          <div><div className="font-bold text-slate-700 text-sm">Explain Simply</div><div className="text-xs text-slate-400">Feynman technique</div></div>
                        </button>
                        <button onClick={() => handleGeminiAction('quiz')} className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-amber-300 hover:shadow-md transition-all text-left group">
                          <div className="bg-amber-50 p-2 rounded-lg text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors"><HelpCircle size={20} /></div>
                          <div><div className="font-bold text-slate-700 text-sm">Generate Quiz</div><div className="text-xs text-slate-400">Test your knowledge</div></div>
                        </button>
                      </div>
                    )}

                    {isAnalyzing && (
                      <div className="flex flex-col items-center justify-center h-full gap-3">
                        <Loader2 className="animate-spin text-indigo-600" size={32} />
                        <p className="text-sm font-medium text-indigo-600 animate-pulse">Analyzing content...</p>
                      </div>
                    )}

                    {aiResponse && !isAnalyzing && (
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-in slide-in-from-bottom-2">
                        <SimpleMarkdown content={aiResponse} />
                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                          <button onClick={saveNote} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors">
                            <Bookmark size={14} /> Save to Notes
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={chatEndRef}></div>
              </div>

              {material && (
                <div className="p-3 bg-white border-t border-slate-200">
                  <form onSubmit={handleCustomSubmit} className="relative flex items-center">
                    <input type="text" placeholder="Ask a specific question..." className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} disabled={isAnalyzing} />
                    <button type="submit" disabled={!aiPrompt.trim() || isAnalyzing} className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"><Send size={16} /></button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {detailTab === 'notes' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <textarea className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-slate-50/50" rows="3" placeholder="Write a quick note..." value={manualNoteContent} onChange={(e) => setManualNoteContent(e.target.value)} />
              <div className="flex justify-end mt-3"><button onClick={saveManualNote} disabled={!manualNoteContent.trim()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50">Add Note</button></div>
            </div>
            {subjectNotes.length === 0 ? <div className="text-center py-12 text-slate-400">No notes recorded.</div> : subjectNotes.map(note => (
              <div key={note.id} className={`p-5 rounded-2xl border shadow-sm relative group ${note.type === 'manual' ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100'}`}>
                <div className="text-xs font-bold mb-3 flex justify-between"><span className="uppercase tracking-wider">{note.date}</span><button onClick={() => setAiNotes(aiNotes.filter(n => n.id !== note.id))}><Trash2 size={14} className="text-slate-400 hover:text-rose-500" /></button></div>
                {note.type === 'ai-generated' ? <SimpleMarkdown content={note.content} /> : <div className="text-sm whitespace-pre-wrap font-medium text-slate-700">{note.content}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

// --- MAIN APP ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');


  const [subjects, setSubjects] = useLocalStorage('study-subjects', []);
  const [tasks, setTasks] = useLocalStorage('study-tasks', []);
  const [aiNotes, setAiNotes] = useLocalStorage('study-ai-notes', []);
  const [subjectMaterials, setSubjectMaterials] = useLocalStorage('study-subject-materials', {});

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', color: COLORS[0].value });
  const [newTask, setNewTask] = useState({ title: '', subjectId: '', dueDate: new Date().toISOString().split('T')[0], isReading: false, totalPages: '' });
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);

  // Define Safe Arrays/Objects
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeSubjects = Array.isArray(subjects) ? subjects : [];
  const safeAiNotes = Array.isArray(aiNotes) ? aiNotes : [];
  const safeMaterials = subjectMaterials || {};
  const [routine, setRoutine] = useLocalStorage('study-daily-routine', []);

  // Stats Logic
  const stats = useMemo(() => {
    const total = safeTasks.length;
    const completed = safeTasks.filter(t => t.completed).length;
    const pending = total - completed;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, pending, percentage };
  }, [safeTasks]);

  const taskGroups = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const overdue = [], today = [], upcoming = [], completed = [];
    safeTasks.forEach(task => {
      if (task.completed) { completed.push(task); return; }
      if (task.dueDate < todayStr) overdue.push(task);
      else if (task.dueDate === todayStr) today.push(task);
      else upcoming.push(task);
    });
    return { overdue, today, upcoming, completed };
  }, [safeTasks]);

  const subjectProgress = useMemo(() => safeSubjects.map(sub => {
    const subTasks = safeTasks.filter(t => t.subjectId === sub.id);
    const done = subTasks.filter(t => t.completed).length;
    const total = subTasks.length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    return { ...sub, percent, tasksLeft: total - done };
  }), [safeSubjects, safeTasks]);

  // Handlers
  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubject.name.trim()) return;
    setSubjects([...safeSubjects, { ...newSubject, id: generateId() }]);
    setNewSubject({ name: '', color: COLORS[0].value });
    setIsSubjectModalOpen(false);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim() || !newTask.subjectId) return;
    const baseTask = { subjectId: newTask.subjectId, dueDate: newTask.dueDate, completed: false };
    let newTasksToAdd = [];
    if (newTask.isReading) {
      newTasksToAdd.push({ ...baseTask, id: generateId(), title: newTask.title.trim(), isReading: true, progress: 0, total: parseInt(newTask.totalPages) || 0 });
    } else {
      const titles = newTask.title.split('\n').filter(t => t.trim());
      newTasksToAdd = titles.map(title => ({ ...baseTask, id: generateId(), title: title.trim(), isReading: false }));
    }
    setTasks([...safeTasks, ...newTasksToAdd]);
    setNewTask({ ...newTask, title: '', isReading: false, totalPages: '' });
    setIsTaskModalOpen(false);
  };

  const toggleTask = (taskId) => setTasks(safeTasks.map(t => t.id === taskId ? { ...t, completed: !t.completed, progress: t.isReading && !t.completed ? t.total : 0 } : t));
  const updateTaskProgress = (taskId, val) => setTasks(safeTasks.map(t => t.id === taskId ? { ...t, progress: Math.min(Math.max(0, parseInt(val) || 0), t.total), completed: (parseInt(val) || 0) >= t.total } : t));
  const deleteTask = (taskId) => setTasks(safeTasks.filter(t => t.id !== taskId));
  const deleteSubject = (subId) => { setSubjects(safeSubjects.filter(s => s.id !== subId)); setTasks(safeTasks.filter(t => t.subjectId !== subId)); if (selectedSubjectId === subId) setSelectedSubjectId(null); };

  return (
    <div className="min-h-screen font-sans text-gray-800 pb-20 md:pb-0 md:flex">
      {/* Sidebar - Light Theme */}
      <div className="hidden md:flex flex-col w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 h-screen fixed left-0 top-0 shadow-xl z-10">
        <div className="p-6 border-b border-gray-100"><h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 tracking-tight"><BookOpen className="text-violet-500" size={24} /> StudyPlan</h1></div>
        <nav className="flex-1 p-4 space-y-2">
          {['dashboard', 'schedule', 'subjects', 'pro'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium capitalize ${activeTab === tab
                ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                : tab === 'pro'
                  ? 'text-amber-500 hover:bg-amber-50'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              {tab === 'dashboard' ? <Layout size={18} />
                : tab === 'schedule' ? <List size={18} />
                  : tab === 'pro' ? <Crown size={18} />
                    : <BookOpen size={18} />}
              {tab === 'pro' ? 'Pro Tools' : tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 p-4 md:p-8 max-w-7xl mx-auto w-full h-screen overflow-hidden">
        {activeTab === 'dashboard' && (
          <ThreeDDashboard
            stats={stats}
            subjects={safeSubjects}
            subjectProgress={subjectProgress}
            setIsSubjectModalOpen={setIsSubjectModalOpen}
            setSelectedSubjectId={setSelectedSubjectId}
          />
        )}

        {activeTab === 'subjects' && (
          <div className="space-y-6 animate-in fade-in h-full overflow-y-auto pb-20">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-extrabold text-slate-800">Subjects</h2><button onClick={() => setIsSubjectModalOpen(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-all">+ New Subject</button></div>
            <div className="grid gap-4">
              {safeSubjects.map(sub => (
                <div key={sub.id} onClick={() => setSelectedSubjectId(sub.id)} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-6"><div className={`w-16 h-16 rounded-2xl ${sub.color} flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>{sub.name.charAt(0)}</div><div><h3 className="font-bold text-xl text-slate-800">{sub.name}</h3></div></div>
                  <button onClick={(e) => { e.stopPropagation(); deleteSubject(sub.id); }} className="text-slate-300 hover:text-rose-500 p-3 rounded-full hover:bg-rose-50 transition-colors"><Trash2 size={20} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schedule View */}
        {activeTab === 'schedule' && (
          <div className="space-y-8 animate-in fade-in h-full overflow-y-auto pb-20">
            <DailyTimetable routine={routine} setRoutine={setRoutine} />

            {taskGroups.overdue.length > 0 && (
              <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100">
                <h3 className="text-rose-600 font-bold text-lg mb-4 flex items-center gap-2"><Clock size={20} /> Overdue</h3>
                {taskGroups.overdue.map(t => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    subjects={safeSubjects}
                    toggleTask={toggleTask}
                    updateTaskProgress={updateTaskProgress}
                    deleteTask={deleteTask}
                  />
                ))}
              </div>
            )}

            <div>
              <h3 className="text-slate-800 font-bold text-xl mb-6 flex items-center gap-2"><CalendarIcon size={22} className="text-indigo-600" /> Today's Plan</h3>
              {taskGroups.today.length === 0 && <div className="text-center py-10 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">No tasks scheduled for today.</div>}
              {taskGroups.today.map(t => (
                <TaskCard
                  key={t.id}
                  task={t}
                  subjects={safeSubjects}
                  toggleTask={toggleTask}
                  updateTaskProgress={updateTaskProgress}
                  deleteTask={deleteTask}
                />
              ))}
            </div>

            {taskGroups.upcoming.length > 0 && (
              <div>
                <h3 className="text-slate-800 font-bold text-xl mb-6">Coming Up</h3>
                {taskGroups.upcoming.map(t => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    subjects={safeSubjects}
                    toggleTask={toggleTask}
                    updateTaskProgress={updateTaskProgress}
                    deleteTask={deleteTask}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* PRO View */}
        {activeTab === 'pro' && (
          <ProView />
        )}
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around p-4 z-40 shadow-[0_-8px_30px_rgba(0,0,0,0.05)] rounded-t-2xl">
        {['dashboard', 'schedule', 'subjects'].map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`flex flex-col items-center ${activeTab === tab ? 'text-indigo-600' : 'text-slate-400'}`}>{tab === 'dashboard' ? <Layout /> : tab === 'schedule' ? <List /> : <BookOpen />}</button>)}
      </div>

      {activeTab !== 'pro' && (
        <button onClick={() => setIsTaskModalOpen(true)} className="fixed right-6 bottom-24 md:bottom-10 bg-gradient-to-r from-indigo-600 to-violet-600 text-white pl-5 pr-6 py-4 rounded-full shadow-2xl shadow-indigo-500/40 hover:scale-110 transition-all z-50 border-4 border-white/20 flex items-center gap-2 group">
          <Plus size={28} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-bold text-sm hidden md:inline-block">Add Task</span>
        </button>
      )}

      {/* Modals */}
      <SubjectDetailModal
        subject={safeSubjects.find(s => s.id === selectedSubjectId)}
        subjects={safeSubjects}
        onClose={() => setSelectedSubjectId(null)}
        tasks={safeTasks}
        aiNotes={safeAiNotes}
        setAiNotes={setAiNotes}
        subjectMaterials={safeMaterials}
        setSubjectMaterials={setSubjectMaterials}
        setIsTaskModalOpen={setIsTaskModalOpen}
        setNewTask={setNewTask}
        toggleTask={toggleTask}
        updateTaskProgress={updateTaskProgress}
        deleteTask={deleteTask}
      />

      <Modal isOpen={isSubjectModalOpen} onClose={() => setIsSubjectModalOpen(false)} title="New Subject">
        <form onSubmit={handleAddSubject} className="space-y-6">
          <div><label className="block text-sm font-bold text-slate-700 mb-2">Name</label><input autoFocus type="text" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={newSubject.name} onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })} /></div>
          <div className="grid grid-cols-3 gap-3">{COLORS.map(c => <button key={c.value} type="button" onClick={() => setNewSubject({ ...newSubject, color: c.value })} className={`h-12 rounded-xl ${c.value} ${newSubject.color === c.value ? 'ring-4 ring-indigo-100 scale-105' : 'opacity-70 hover:opacity-100'}`} />)}</div>
          <button type="submit" className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold">Create</button>
        </form>
      </Modal>

      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="New Task">
        <form onSubmit={handleAddTask} className="space-y-5">
          <div className="flex p-1 bg-slate-100 rounded-xl mb-2">
            <button type="button" onClick={() => setNewTask({ ...newTask, isReading: false })} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!newTask.isReading ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>SIMPLE TASK</button>
            <button type="button" onClick={() => setNewTask({ ...newTask, isReading: true })} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${newTask.isReading ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>READING</button>
          </div>
          <div><label className="block text-sm font-bold text-slate-700 mb-2">{newTask.isReading ? 'Book Title' : 'Task'}</label>{newTask.isReading ? <input autoFocus className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} /> : <textarea autoFocus className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" rows={3} value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />}</div>
          {newTask.isReading && <div><label className="block text-sm font-bold text-slate-700 mb-2">Pages</label><input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={newTask.totalPages} onChange={(e) => setNewTask({ ...newTask, totalPages: e.target.value })} /></div>}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-bold text-slate-700 mb-2">Subject</label><select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={newTask.subjectId} onChange={(e) => setNewTask({ ...newTask, subjectId: e.target.value })}><option value="">Select...</option>{safeSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-2">Date</label><input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} /></div>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold">Add</button>
        </form>
      </Modal>
    </div>
  );
}


