import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Bot,
  ExternalLink,
  HelpCircle,
  FileCheck2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { api } from '../../lib/api.js';
import type { AIContextOutput } from '../../types.js';

interface AIContextViewProps {
  onNavigateToAssessments: () => void;
}

export const AIContextView: React.FC<AIContextViewProps> = ({ onNavigateToAssessments }) => {
  const [contextData, setContextData] = useState<AIContextOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContext = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAIContext();
      setContextData(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate AI Context.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContext();
  }, []);

  const handleCopy = async () => {
    if (!contextData?.formattedMarkdown) return;
    try {
      await navigator.clipboard.writeText(contextData.formattedMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = contextData.formattedMarkdown;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-[#131C31] to-[#0B1120] border border-cyan-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>INTERCHANGEABLE AI TEACHER PROTOCOL</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-sans">
              AI Context Generator
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              The Learning OS holds your persistent state. Copy this synthesized context into ChatGPT, Claude, Gemini, or any LLM so your external mentor knows exactly who you are, what you have mastered, and what mission to assign.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="refresh-ai-context-btn"
              onClick={fetchContext}
              disabled={loading}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl transition-colors"
              title="Refresh Context"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              id="copy-ai-context-main-btn"
              onClick={handleCopy}
              disabled={loading || !contextData}
              className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-mono text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/20"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-cyan-200" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy AI Context</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3-Step Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
          <div className="flex items-center space-x-2 text-cyan-400 font-semibold">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px]">1</span>
            <span>Copy Context</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Click &quot;Copy AI Context&quot; to copy your structured roadmap position, verified skill levels, and learning history.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
          <div className="flex items-center space-x-2 text-blue-400 font-semibold">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px]">2</span>
            <span>Paste into External AI</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Paste into ChatGPT, Claude, or Gemini. The prompt instructs the AI to mentor you with hints rather than giving solutions.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">3</span>
            <span>Record Assessment</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            When the external AI finishes evaluating your work, bring the assessment back into Learning OS to update your skills.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 bg-red-950/40 border border-red-800/60 p-4 rounded-xl text-red-300 text-xs">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Generated Markdown Preview */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="bg-[#0B1120] px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-semibold text-white">Generated Markdown Prompt Context</span>
          </div>
          <button
            onClick={handleCopy}
            className="text-xs font-mono text-slate-400 hover:text-white flex items-center space-x-1 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>
        </div>

        <div className="p-5 font-mono text-xs text-slate-300 leading-relaxed bg-[#0B1120]/50 max-h-[600px] overflow-y-auto whitespace-pre-wrap select-all">
          {loading ? (
            <div className="py-12 text-center text-slate-500 animate-pulse">
              Synthesizing learning history, roadmap metrics, and AI teacher directives...
            </div>
          ) : (
            contextData?.formattedMarkdown
          )}
        </div>
      </div>

      {/* Next Action Callout */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="text-xs text-slate-300 font-mono">
          Ready to save feedback from your AI teacher?
        </div>
        <button
          onClick={onNavigateToAssessments}
          className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-mono px-3.5 py-2 rounded-lg transition-colors border border-slate-700"
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Open Assessment Import & History</span>
        </button>
      </div>
    </div>
  );
};
