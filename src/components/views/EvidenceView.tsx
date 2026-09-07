import React, { useState, useEffect } from 'react';
import { Link2, PlusCircle, Github, ExternalLink, GitCommit } from 'lucide-react';
import { api } from '../../lib/api.js';
import type { Evidence } from '../../types.js';

export const EvidenceView: React.FC = () => {
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [commitUrl, setCommitUrl] = useState('');
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEvidence = async () => {
    try {
      const data = await api.getEvidence();
      setEvidences(data);
    } catch (err) {
      console.error('Failed to load evidence:', err);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await api.createEvidence({
        title,
        description,
        githubRepo: githubRepo.trim() || undefined,
        commitUrl: commitUrl.trim() || undefined,
        url: url.trim() || undefined
      });
      setTitle('');
      setDescription('');
      setGithubRepo('');
      setCommitUrl('');
      setUrl('');
      setIsOpen(false);
      await fetchEvidence();
    } catch (err) {
      console.error('Failed to save evidence:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131C31] border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <Link2 className="w-4 h-4" />
            <span>PROOF OF WORK & ARTIFACTS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Evidence & GitHub Repositories</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Store GitHub repositories, commit hashes, and URLs that prove your completed tasks and configurations.
          </p>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono px-4 py-2.5 rounded-xl font-medium transition-all shadow-md self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isOpen ? 'Close Form' : 'Log Evidence'}</span>
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="bg-[#131C31] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h2 className="text-sm font-semibold text-white font-mono">Log Technical Proof / Artifact</h2>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Evidence Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. K8s Multi-tier Deployment & Ingress Manifests"
              className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Production Deployment yaml with readiness probes and ClusterIP service"
              className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">GitHub Repository URL</label>
              <input
                type="url"
                value={githubRepo}
                onChange={e => setGithubRepo(e.target.value)}
                placeholder="https://github.com/myuser/devops-lab"
                className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Commit URL / Hash</label>
              <input
                type="url"
                value={commitUrl}
                onChange={e => setCommitUrl(e.target.value)}
                placeholder="https://github.com/myuser/devops-lab/commit/abc123"
                className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
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
              {submitting ? 'Saving...' : 'Save Evidence'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {evidences.map(item => (
          <div key={item.id} className="bg-[#131C31]/80 border border-slate-800 rounded-xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
              <span className="text-xs font-mono text-slate-500">
                {new Date(item.date).toLocaleDateString()}
              </span>
            </div>

            {item.description && <p className="text-xs text-slate-300 font-sans">{item.description}</p>}

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
              {item.githubRepo && (
                <a
                  href={item.githubRepo}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 bg-[#0B1120] px-2.5 py-1 rounded border border-slate-800"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>Repository</span>
                  <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                </a>
              )}
              {item.commitUrl && (
                <a
                  href={item.commitUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 bg-[#0B1120] px-2.5 py-1 rounded border border-slate-800"
                >
                  <GitCommit className="w-3.5 h-3.5" />
                  <span>Commit Evidence</span>
                  <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
