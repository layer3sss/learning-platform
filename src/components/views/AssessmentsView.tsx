import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  PlusCircle,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  Bot,
  Calendar,
  CheckCircle2,
  XCircle,
  ChevronRight
} from 'lucide-react';
import { api } from '../../lib/api.js';
import type { Assessment, AssessmentStatus } from '../../types.js';

interface AssessmentsViewProps {
  onAssessmentRecorded?: () => void;
}

export const AssessmentsView: React.FC<AssessmentsViewProps> = ({ onAssessmentRecorded }) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [taskTitle, setTaskTitle] = useState('Configure Terminal & Shell Environment');
  const [status, setStatus] = useState<AssessmentStatus>('PASSED');
  const [summary, setSummary] = useState('');
  const [aiTeacherName, setAiTeacherName] = useState('ChatGPT / Claude');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [conceptsToPractice, setConceptsToPractice] = useState('');
  const [recommendedNextTask, setRecommendedNextTask] = useState('');
  const [rawAssessmentText, setRawAssessmentText] = useState('');

  const fetchAssessments = async () => {
    try {
      const data = await api.getAssessments();
      setAssessments(data);
    } catch (err) {
      console.error('Failed to load assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) {
      setError('Please provide a summary of the assessment.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.createAssessment({
        taskTitle,
        status,
        summary,
        aiTeacherName,
        strengths: strengths.split(',').map(s => s.trim()).filter(Boolean),
        weaknesses: weaknesses.split(',').map(s => s.trim()).filter(Boolean),
        conceptsToPractice: conceptsToPractice.split(',').map(s => s.trim()).filter(Boolean),
        recommendedNextTask: recommendedNextTask.trim() || undefined,
        rawAssessmentText: rawAssessmentText.trim() || undefined
      });

      // Reset form & reload
      setSummary('');
      setStrengths('');
      setWeaknesses('');
      setConceptsToPractice('');
      setRecommendedNextTask('');
      setRawAssessmentText('');
      setIsFormOpen(false);
      await fetchAssessments();
      if (onAssessmentRecorded) onAssessmentRecorded();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to record assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131C31] border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <FileCheck2 className="w-4 h-4" />
            <span>AI TEACHER EVALUATIONS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Assessments Archive & Import</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Record evaluations from external AI mentors to permanently update your verified skills and recommended next steps.
          </p>
        </div>

        <button
          id="open-record-assessment-btn"
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono px-4 py-2.5 rounded-xl font-medium transition-all shadow-md self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isFormOpen ? 'Close Form' : 'Record New Assessment'}</span>
        </button>
      </div>

      {/* Structured Assessment Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-[#131C31]/95 border border-cyan-500/30 rounded-2xl p-6 space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold font-mono text-white flex items-center space-x-2">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Record External AI Assessment</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Step 3 of Learning Method</span>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Task Name / Focus</label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                placeholder="e.g. Configure Terminal & Shell"
                className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Assessment Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as AssessmentStatus)}
                className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="PASSED">PASSED — Task criteria fully demonstrated</option>
                <option value="PARTIAL">PARTIAL — Functioning but gaps identified</option>
                <option value="FAILED">FAILED — Major defects or blockers encountered</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">AI Teacher Model</label>
              <input
                type="text"
                value={aiTeacherName}
                onChange={e => setAiTeacherName(e.target.value)}
                placeholder="e.g. Claude 3.5 Sonnet / ChatGPT"
                className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Summary of Evaluation *</label>
            <textarea
              required
              rows={2}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="e.g. Correctly inspected systemd unit status and adjusted restart limit parameters. Handled edge case gracefully."
              className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-3 py-2 text-xs font-sans text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Strengths Demonstrated (comma-separated)</label>
              <input
                type="text"
                value={strengths}
                onChange={e => setStrengths(e.target.value)}
                placeholder="systemd unit syntax, journalctl filtering, signal handling"
                className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Concepts to Practice (comma-separated)</label>
              <input
                type="text"
                value={conceptsToPractice}
                onChange={e => setConceptsToPractice(e.target.value)}
                placeholder="systemd timers, cgroup resource limits"
                className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Recommended Next Task</label>
            <input
              type="text"
              value={recommendedNextTask}
              onChange={e => setRecommendedNextTask(e.target.value)}
              placeholder="e.g. Create an automated timer unit to rotate logs every midnight"
              className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Raw Assessment Feedback (Optional, paste full AI text)</label>
            <textarea
              rows={3}
              value={rawAssessmentText}
              onChange={e => setRawAssessmentText(e.target.value)}
              placeholder="Paste raw markdown feedback from ChatGPT/Claude/Gemini..."
              className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-mono text-xs font-semibold rounded-lg transition-all shadow-md"
            >
              {submitting ? 'Saving...' : 'Save Assessment to Learning OS'}
            </button>
          </div>
        </form>
      )}

      {/* History List */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Recorded Assessments ({assessments.length})
        </h2>

        {assessments.length > 0 ? (
          assessments.map(item => (
            <div key={item.id} className="bg-[#131C31]/80 border border-slate-800 rounded-xl p-5 space-y-3 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center space-x-3">
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      item.status === 'PASSED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : item.status === 'PARTIAL'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {item.status}
                  </span>
                  <h3 className="text-sm font-semibold text-white font-sans">{item.taskTitle || 'DevOps Task Assessment'}</h3>
                </div>
                <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
                  <span>Teacher: {item.aiTeacherName}</span>
                  <span>•</span>
                  <span>{new Date(item.date).toLocaleDateString()}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">{item.summary}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono pt-1">
                {item.strengths && item.strengths.length > 0 && (
                  <div className="bg-[#0B1120]/70 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-cyan-400 font-semibold">Strengths:</span>{' '}
                    <span className="text-slate-300">{item.strengths.join(', ')}</span>
                  </div>
                )}
                {item.conceptsToPractice && item.conceptsToPractice.length > 0 && (
                  <div className="bg-[#0B1120]/70 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-amber-400 font-semibold">Needs Practice:</span>{' '}
                    <span className="text-slate-300">{item.conceptsToPractice.join(', ')}</span>
                  </div>
                )}
              </div>

              {item.recommendedNextTask && (
                <div className="text-xs font-mono text-slate-400 pt-1">
                  Next Task Recommended: <span className="text-blue-400 font-medium">{item.recommendedNextTask}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-[#0B1120]/40 border border-dashed border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500">
            No assessments recorded yet. Click &quot;Record New Assessment&quot; above to store evaluations from your external AI mentor.
          </div>
        )}
      </div>
    </div>
  );
};
