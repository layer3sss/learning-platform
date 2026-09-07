import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, ChevronRight, Award, Layers } from 'lucide-react';
import { api } from '../../lib/api.js';
import type { Skill, UserSkill } from '../../types.js';

export const SkillsView: React.FC = () => {
  const [skillsData, setSkillsData] = useState<{ allSkills: Skill[]; userSkills: UserSkill[] }>({
    allSkills: [],
    userSkills: []
  });
  const [loading, setLoading] = useState(true);

  const fetchSkills = async () => {
    try {
      const data = await api.getSkills();
      setSkillsData(data);
    } catch (err) {
      console.error('Failed to load skills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleLevelChange = async (skillId: string, level: number) => {
    try {
      await api.updateSkill(skillId, level);
      fetchSkills();
    } catch (err) {
      console.error('Failed to update skill level:', err);
    }
  };

  const userSkillMap = new Map<string, UserSkill>(skillsData.userSkills.map(s => [s.skillId, s]));

  // Group skills by category
  const categories = Array.from(new Set(skillsData.allSkills.map(s => s.category)));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="bg-[#131C31] border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
          <Cpu className="w-4 h-4" />
          <span>CAPABILITY MATRIX</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">DevOps Skills System (Levels 0–5)</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Skill levels represent demonstrated capability through practical building, troubleshooting, and AI teacher assessments:
          0 (Not introduced) → 1 (Basic concepts) → 2 (With guidance) → 3 (Independently) → 4 (Troubleshoots) → 5 (Production architect).
        </p>
      </div>

      <div className="space-y-6">
        {categories.map(cat => {
          const catSkills = skillsData.allSkills.filter(s => s.category === cat);
          return (
            <div key={cat} className="bg-[#131C31]/70 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
              <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-2 border-b border-slate-800/80 pb-2">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>{cat}</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {catSkills.map(skill => {
                  const userSkill = userSkillMap.get(skill.id);
                  const currentLevel = userSkill?.level ?? 0;
                  return (
                    <div
                      key={skill.id}
                      className="bg-[#0B1120]/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white text-sm font-sans">{skill.name}</span>
                          <span className="text-xs font-mono font-bold text-cyan-400">
                            Level {currentLevel} / 5
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{skill.description}</p>
                      </div>

                      {/* Level Step Selector (0 to 5) */}
                      <div className="flex items-center space-x-1.5 pt-1">
                        {[0, 1, 2, 3, 4, 5].map(lvl => (
                          <button
                            key={lvl}
                            onClick={() => handleLevelChange(skill.id, lvl)}
                            title={`Set level to ${lvl}`}
                            className={`flex-1 py-1 rounded text-[11px] font-mono font-semibold transition-all border ${
                              currentLevel >= lvl && lvl > 0
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                : currentLevel === 0 && lvl === 0
                                ? 'bg-slate-800 text-slate-400 border-slate-700'
                                : 'bg-[#0B1120] text-slate-600 border-slate-800/80 hover:bg-slate-800'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
