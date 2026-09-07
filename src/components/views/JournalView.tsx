import React, { useState, useEffect } from 'react';
import { BookOpen, PlusCircle, Tag, Calendar, Sparkles } from 'lucide-react';
import { api } from '../../lib/api.js';
import type { JournalEntry } from '../../types.js';

export const JournalView: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchJournal = async () => {
    try {
      const data = await api.getJournal();
      setEntries(data);
    } catch (err) {
      console.error('Failed to load journal:', err);
    }
  };

  useEffect(() => {
    fetchJournal();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await api.createJournalEntry({
        title,
        content,
        tags: tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
      });
      setTitle('');
      setContent('');
      setTags('');
      setIsOpen(false);
      await fetchJournal();
    } catch (err) {
      console.error('Failed to save journal:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131C31] border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <BookOpen className="w-4 h-4" />
            <span>TROUBLESHOOTING & DISCOVERIES</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">DevOps Learning Journal</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Record what broke, how you diagnosed it, and key insights. Relevant notes are automatically provided to your external AI teacher.
          </p>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono px-4 py-2.5 rounded-xl font-medium transition-all shadow-md self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isOpen ? 'Close Form' : 'New Journal Entry'}</span>
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="bg-[#131C31] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h2 className="text-sm font-semibold text-white font-mono">Create Journal Note</h2>
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Diagnosing Nginx 502 Bad Gateway with netstat"
              className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Discovery / Experience Notes *</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="What did you build? What broke? What command revealed the root cause?"
              className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-3 py-2 text-xs font-sans text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="linux, nginx, troubleshooting, systemd"
              className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold rounded-lg shadow-md"
            >
              {submitting ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {entries.map(entry => (
          <div key={entry.id} className="bg-[#131C31]/80 border border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">{entry.title}</h3>
              <span className="text-xs font-mono text-slate-500">
                {new Date(entry.date).toLocaleDateString()}
              </span>
            </div>
            <p className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">{entry.content}</p>
            {entry.tags && entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {entry.tags.map((tag, idx) => (
                  <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0B1120] text-slate-400 border border-slate-800">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
