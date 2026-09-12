import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Trash2,
  ExternalLink,
  Code2,
  GraduationCap,
  FolderGit2,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { CandidateProfile, Skill, Project, Education } from '../types.js';

interface ProfileViewProps {
  profile: CandidateProfile | null;
  onUpdateProfile: (updated: Partial<CandidateProfile>) => Promise<void>;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, onUpdateProfile }) => {
  const [formData, setFormData] = useState<CandidateProfile>(
    profile || {
      id: '',
      userId: '',
      name: '',
      email: '',
      phone: '',
      location: '',
      headline: '',
      summary: '',
      githubUrl: '',
      linkedinUrl: '',
      portfolioUrl: '',
      skills: [],
      education: [],
      projects: [],
      createdAt: '',
      updatedAt: '',
    }
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Skill Modal / Input State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCat, setNewSkillCat] = useState('Languages');
  const [newSkillProf, setNewSkillProf] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Intermediate');
  const [newSkillYrs, setNewSkillYrs] = useState(2);

  // New Project State
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjTech, setNewProjTech] = useState('');
  const [newProjGithub, setNewProjGithub] = useState('');
  const [newProjHighlights, setNewProjHighlights] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);

  // New Education State
  const [newEduInst, setNewEduInst] = useState('');
  const [newEduDeg, setNewEduDeg] = useState('');
  const [newEduField, setNewEduField] = useState('');
  const [newEduStart, setNewEduStart] = useState(2018);
  const [newEduEnd, setNewEduEnd] = useState(2022);
  const [newEduCgpa, setNewEduCgpa] = useState('3.8/4.0');
  const [showAddEdu, setShowAddEdu] = useState(false);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateProfile(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const newSkill: Skill = {
      id: `skill-${Date.now()}`,
      name: newSkillName.trim(),
      category: newSkillCat,
      proficiency: newSkillProf,
      yearsOfExperience: Number(newSkillYrs),
    };
    const updatedSkills = [...formData.skills, newSkill];
    setFormData({ ...formData, skills: updatedSkills });
    setNewSkillName('');
    onUpdateProfile({ skills: updatedSkills });
  };

  const handleDeleteSkill = (skillId: string) => {
    const updated = formData.skills.filter((s) => s.id !== skillId);
    setFormData({ ...formData, skills: updated });
    onUpdateProfile({ skills: updated });
  };

  const handleAddProject = () => {
    if (!newProjName.trim() || !newProjDesc.trim()) return;
    const project: Project = {
      id: `proj-${Date.now()}`,
      name: newProjName.trim(),
      description: newProjDesc.trim(),
      technologies: newProjTech.split(',').map((t) => t.trim()).filter(Boolean),
      githubUrl: newProjGithub.trim(),
      highlights: newProjHighlights.split('\n').map((h) => h.trim()).filter(Boolean),
    };
    const updatedProjects = [...formData.projects, project];
    setFormData({ ...formData, projects: updatedProjects });
    setNewProjName('');
    setNewProjDesc('');
    setNewProjTech('');
    setNewProjGithub('');
    setNewProjHighlights('');
    setShowAddProject(false);
    onUpdateProfile({ projects: updatedProjects });
  };

  const handleDeleteProject = (projId: string) => {
    const updated = formData.projects.filter((p) => p.id !== projId);
    setFormData({ ...formData, projects: updated });
    onUpdateProfile({ projects: updated });
  };

  const handleAddEducation = () => {
    if (!newEduInst.trim() || !newEduDeg.trim()) return;
    const edu: Education = {
      id: `edu-${Date.now()}`,
      institution: newEduInst.trim(),
      degree: newEduDeg.trim(),
      field: newEduField.trim(),
      startYear: Number(newEduStart),
      endYear: Number(newEduEnd),
      cgpa: newEduCgpa.trim(),
    };
    const updatedEdu = [...formData.education, edu];
    setFormData({ ...formData, education: updatedEdu });
    setNewEduInst('');
    setNewEduDeg('');
    setNewEduField('');
    setShowAddEdu(false);
    onUpdateProfile({ education: updatedEdu });
  };

  const handleDeleteEducation = (eduId: string) => {
    const updated = formData.education.filter((e) => e.id !== eduId);
    setFormData({ ...formData, education: updated });
    onUpdateProfile({ education: updated });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <UserCheck className="h-6 w-6 text-indigo-400" />
            Verified Candidate Profile
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            This profile is your ground-truth source. HirePilot AI strictly analyzes verified skills and projects without hallucinating.
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {isSaving ? (
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saveSuccess ? 'Changes Saved!' : 'Save Profile'}
        </button>
      </div>

      {saveSuccess && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          Profile updated successfully in PostgreSQL-compatible database.
        </div>
      )}

      {/* Basic Candidate Information */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <h2 className="text-base font-semibold text-white">General Information</h2>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-slate-300">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300">Target Headline</label>
            <input
              type="text"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-300">Professional Summary</label>
          <textarea
            rows={3}
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:border-indigo-500 focus:outline-none leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="text-xs font-medium text-slate-300">GitHub Profile URL</label>
            <input
              type="url"
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-300">LinkedIn Profile URL</label>
            <input
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-300">Portfolio Website</label>
            <input
              type="url"
              value={formData.portfolioUrl}
              onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Verified Skills Catalog */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Code2 className="h-4 w-4 text-indigo-400" />
              Verified Technical Skills ({formData.skills.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Skills used in resume generation, gap analysis, and interview simulations.
            </p>
          </div>
        </div>

        {/* Add Skill Form */}
        <div className="grid grid-cols-1 gap-2.5 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 sm:grid-cols-5">
          <div className="sm:col-span-2">
            <input
              type="text"
              placeholder="Skill name (e.g. Spring Security, Kafka)"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <select
              value={newSkillCat}
              onChange={(e) => setNewSkillCat(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="Languages">Languages</option>
              <option value="Frameworks">Frameworks</option>
              <option value="Databases">Databases</option>
              <option value="DevOps & Cloud">DevOps &amp; Cloud</option>
              <option value="Architecture">Architecture</option>
            </select>
          </div>
          <div>
            <select
              value={newSkillProf}
              onChange={(e) => setNewSkillProf(e.target.value as any)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
          <div>
            <button
              onClick={handleAddSkill}
              className="w-full rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
            >
              + Add Skill
            </button>
          </div>
        </div>

        {/* Skill Badges */}
        <div className="flex flex-wrap gap-2 pt-2">
          {formData.skills.map((skill) => (
            <div
              key={skill.id}
              className="group flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs transition hover:border-slate-700"
            >
              <div>
                <span className="font-semibold text-slate-200">{skill.name}</span>
                <span className="ml-1.5 text-[10px] text-slate-400">
                  {skill.proficiency} • {skill.yearsOfExperience}y
                </span>
              </div>
              <button
                onClick={() => handleDeleteSkill(skill.id)}
                className="text-slate-500 opacity-0 transition group-hover:opacity-100 hover:text-rose-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio Projects */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <FolderGit2 className="h-4 w-4 text-sky-400" />
              Verified Portfolio Projects ({formData.projects.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked and highlighted by HirePilot AI against each job's requirements.
            </p>
          </div>

          <button
            onClick={() => setShowAddProject(!showAddProject)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Project
          </button>
        </div>

        {/* Add Project Form */}
        {showAddProject && (
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              New Verified Project
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Project Name (e.g. Distributed Payment Gateway)"
                value={newProjName}
                onChange={(e) => setNewProjName(e.target.value)}
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Technologies (comma-separated: Java, Spring Boot, PostgreSQL)"
                value={newProjTech}
                onChange={(e) => setNewProjTech(e.target.value)}
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <textarea
              rows={2}
              placeholder="Description of the project..."
              value={newProjDesc}
              onChange={(e) => setNewProjDesc(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
            <textarea
              rows={2}
              placeholder="Quantifiable Highlights (one bullet per line, e.g. Processed 10,000 req/sec with 99.9% uptime)"
              value={newProjHighlights}
              onChange={(e) => setNewProjHighlights(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
            <input
              type="url"
              placeholder="GitHub Repository URL"
              value={newProjGithub}
              onChange={(e) => setNewProjGithub(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddProject(false)}
                className="rounded-lg border border-slate-800 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProject}
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Save Project
              </button>
            </div>
          </div>
        )}

        {/* Existing Projects List */}
        <div className="space-y-3">
          {formData.projects.map((proj) => (
            <div
              key={proj.id}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{proj.name}</span>
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-400 hover:underline inline-flex items-center gap-1"
                      >
                        GitHub <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{proj.description}</p>
                </div>
                <button
                  onClick={() => handleDeleteProject(proj.id)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Technologies */}
              <div className="flex flex-wrap gap-1.5">
                {proj.technologies.map((t, idx) => (
                  <span
                    key={idx}
                    className="rounded bg-slate-900 px-2 py-0.5 text-[10px] font-medium text-slate-300 border border-slate-800"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Highlights */}
              {proj.highlights && proj.highlights.length > 0 && (
                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-400">
                  {proj.highlights.map((h, idx) => (
                    <li key={idx}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-emerald-400" />
            Education ({formData.education.length})
          </h2>

          <button
            onClick={() => setShowAddEdu(!showAddEdu)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Degree
          </button>
        </div>

        {showAddEdu && (
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                type="text"
                placeholder="Institution (e.g. UC Berkeley)"
                value={newEduInst}
                onChange={(e) => setNewEduInst(e.target.value)}
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
              />
              <input
                type="text"
                placeholder="Degree (e.g. B.S.)"
                value={newEduDeg}
                onChange={(e) => setNewEduDeg(e.target.value)}
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
              />
              <input
                type="text"
                placeholder="Field (e.g. Computer Science)"
                value={newEduField}
                onChange={(e) => setNewEduField(e.target.value)}
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddEdu(false)}
                className="rounded-lg border border-slate-800 px-3 py-1.5 text-xs text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEducation}
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                Save Education
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {formData.education.map((edu) => (
            <div
              key={edu.id}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3.5"
            >
              <div>
                <div className="font-semibold text-white text-sm">
                  {edu.degree} in {edu.field}
                </div>
                <div className="text-xs text-slate-400">
                  {edu.institution} • {edu.startYear} – {edu.endYear} {edu.cgpa && `• CGPA: ${edu.cgpa}`}
                </div>
              </div>
              <button
                onClick={() => handleDeleteEducation(edu.id)}
                className="text-slate-500 hover:text-rose-400 p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
