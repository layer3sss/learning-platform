import React, { useState, useEffect } from 'react';
import {
  Map,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../../lib/api.js';
import type { RoadmapLevel, TaskStatus, Task, Project } from '../../types.js';

interface RoadmapViewProps {
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onNavigateToAIContext: () => void;
  onNavigateToAssessments: () => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  onUpdateTaskStatus,
  onNavigateToAIContext,
  onNavigateToAssessments
}) => {
  const [roadmap, setRoadmap] = useState<RoadmapLevel[]>([]);
  const [selectedLevelNum, setSelectedLevelNum] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchRoadmap = async () => {
    try {
      const data = await api.getRoadmap();
      setRoadmap(data);
    } catch (err) {
      console.error('Failed to load roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const selectedLevel = roadmap.find(lvl => lvl.levelNumber === selectedLevelNum) || roadmap[0];

  const getStatusPill = (status?: TaskStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">COMPLETED</span>;
      case 'IN_PROGRESS':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">IN PROGRESS</span>;
      case 'BLOCKED':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">BLOCKED</span>;
      case 'REQUIRES_PRACTICE':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">NEEDS PRACTICE</span>;
      default:
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">TODO</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131C31]/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <Map className="w-4 h-4" />
            <span>DEV-OPS CURRICULUM ROADMAP</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">DevOps Hands-on Roadmap</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Level 0 through Level 13: Learn by building, breaking, troubleshooting, and verifying real systems.
          </p>
        </div>

        <button
          onClick={onNavigateToAIContext}
          className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono px-3.5 py-2 rounded-lg font-medium transition-all shadow-md self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Copy AI Context</span>
        </button>
      </div>

      {/* Level Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
        {roadmap.map(lvl => {
          const isSelected = lvl.levelNumber === selectedLevelNum;
          return (
            <button
              key={lvl.levelNumber}
              onClick={() => setSelectedLevelNum(lvl.levelNumber)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all border ${
                isSelected
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              L{lvl.levelNumber}: {lvl.title.split('—')[1]?.trim() || lvl.title}
            </button>
          );
        })}
      </div>

      {/* Active Level Detail Card */}
      {selectedLevel && (
        <div className="bg-[#131C31] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="border-b border-slate-800 pb-4">
            <div className="text-xs font-mono text-cyan-400 font-semibold mb-1">
              LEVEL {selectedLevel.levelNumber}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{selectedLevel.title}</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">{selectedLevel.description}</p>

            {/* Topics Tags */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {selectedLevel.topics.map((t, idx) => (
                <span key={idx} className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#0B1120] text-slate-300 border border-slate-800">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Projects & Tasks list */}
          <div className="space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Projects in Level {selectedLevel.levelNumber} ({selectedLevel.projects.length})</span>
            </h3>

            {selectedLevel.projects.map(proj => (
              <div key={proj.id} className="bg-[#0B1120]/70 border border-slate-800/90 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <h4 className="text-base font-semibold text-white font-sans">{proj.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{proj.description}</p>
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Progress: <span className="text-cyan-400 font-bold">{proj.userProgressPercent || 0}%</span>
                  </div>
                </div>

                {/* Tasks List */}
                <div className="space-y-3">
                  <div className="text-[11px] font-mono text-slate-400 uppercase">Actionable Tasks ({proj.tasks.length}):</div>
                  {proj.tasks.map((task: Task) => (
                    <div
                      key={task.id}
                      className="bg-slate-900/60 border border-slate-800/70 rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-slate-400">#{task.order}</span>
                          <span className="text-xs font-semibold text-slate-200">{task.title}</span>
                          {getStatusPill(task.userStatus)}
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {task.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{task.description}</p>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Objective: <span className="text-slate-300">{task.objective}</span>
                        </div>
                      </div>

                      {/* Interactive Task Status Toggles */}
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          onClick={() => {
                            onUpdateTaskStatus(task.id, 'IN_PROGRESS');
                            fetchRoadmap();
                          }}
                          className={`text-xs font-mono px-2.5 py-1 rounded border transition-colors ${
                            task.userStatus === 'IN_PROGRESS'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold'
                              : 'bg-[#0B1120] text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          Start
                        </button>
                        <button
                          onClick={() => {
                            onUpdateTaskStatus(task.id, 'COMPLETED');
                            fetchRoadmap();
                          }}
                          className={`text-xs font-mono px-2.5 py-1 rounded border transition-colors ${
                            task.userStatus === 'COMPLETED'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                              : 'bg-[#0B1120] text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
