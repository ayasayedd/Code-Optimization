import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  FolderOpen,
  Plus,
  Trash2,
  Pencil,
  FileText,
  Upload,
  X,
  Check,
} from "lucide-react";
import {
  apiGetProjects,
  apiCreateProject,
  apiUpdateProject,
  apiDeleteProject,
  apiGetProjectFiles,
  apiUploadFile,
  apiDeleteFile,
  type Project,
  type ProjectFile,
} from "@/lib/api";

function FileItem({
  file,
  onDelete,
}: {
  file: ProjectFile;
  onDelete: (id: number) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiDeleteFile(file.id);
      onDelete(file.id);
    } catch {}
    setDeleting(false);
  };

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-[8px] border border-gray-100">
      <div className="flex items-center gap-2 min-w-0">
        <FileText className="w-4 h-4 text-[#002a63] shrink-0" />
        <span className="text-sm text-gray-700 truncate">{file.name}</span>
        {file.size && (
          <span className="text-xs text-gray-400 shrink-0">
            {(file.size / 1024).toFixed(1)} KB
          </span>
        )}
      </div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="ml-2 p-1 rounded hover:text-red-500 text-gray-400 transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function ProjectCard({
  project,
  onDelete,
}: {
  project: Project;
  onDelete: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [editDesc, setEditDesc] = useState(project.description ?? "");
  const [saving, setSaving] = useState(false);
  const [localProject, setLocalProject] = useState(project);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExpand = async () => {
    if (!expanded && files.length === 0) {
      setLoadingFiles(true);
      try {
        const f = await apiGetProjectFiles(project.id);
        setFiles(f);
      } catch {}
      setLoadingFiles(false);
    }
    setExpanded((v) => !v);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await apiUpdateProject(project.id, {
        name: editName,
        description: editDesc,
      });
      setLocalProject(updated);
      setEditing(false);
    } catch {}
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this project and all its files?")) return;
    setDeleting(true);
    try {
      await apiDeleteProject(project.id);
      onDelete(project.id);
    } catch {}
    setDeleting(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await apiUploadFile(project.id, file);
      setFiles((prev) => [...prev, uploaded]);
    } catch {}
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-white rounded-[16px] shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <button
            onClick={handleExpand}
            className="flex items-center gap-3 min-w-0 text-left hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#002a63] to-[#df33a8] flex items-center justify-center shrink-0">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              {editing ? null : (
                <>
                  <p className="font-semibold text-[#002a63]">{localProject.name}</p>
                  {localProject.description && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {localProject.description}
                    </p>
                  )}
                </>
              )}
            </div>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setEditing((v) => !v)}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-[#002a63] transition-colors"
              title="Edit project"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              title="Delete project"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {editing && (
          <div className="mt-4 space-y-3">
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Project name"
              className="w-full border border-gray-200 rounded-[8px] px-3 py-2 text-sm outline-none focus:border-[#002a63]"
            />
            <input
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full border border-gray-200 rounded-[8px] px-3 py-2 text-sm outline-none focus:border-[#002a63]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving || !editName.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#002a63] text-white text-sm font-medium disabled:opacity-60"
              >
                <Check className="w-3.5 h-3.5" />
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] border border-gray-200 text-gray-600 text-sm font-medium"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {expanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="flex items-center justify-between mt-4 mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Files
            </p>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#002a63] hover:text-[#df33a8] transition-colors disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                {uploading ? "Uploading…" : "Upload File"}
              </button>
            </div>
          </div>

          {loadingFiles && (
            <p className="text-sm text-gray-400 animate-pulse">Loading files…</p>
          )}

          {!loadingFiles && files.length === 0 && (
            <p className="text-sm text-gray-400">No files uploaded yet.</p>
          )}

          <div className="space-y-2">
            {files.map((f) => (
              <FileItem
                key={f.id}
                file={f}
                onDelete={(id) => setFiles((prev) => prev.filter((x) => x.id !== id))}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiGetProjects()
      .then(setProjects)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load projects."))
      .finally(() => setIsLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const created = await apiCreateProject(newName.trim(), newDesc.trim());
      setProjects((prev) => [created, ...prev]);
      setNewName("");
      setNewDesc("");
      setCreating(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create project.");
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#002a63]">
      <header className="bg-white h-[100px] flex items-center px-6 lg:px-10 shadow-sm">
        <div className="flex items-center justify-between w-full max-w-[1440px] mx-auto">
          <img
            src="/figmaAssets/pink-purple-gradient-modern-technology-logo--1--2.png"
            alt="Logo"
            className="w-[80px] h-[80px] object-contain"
          />
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/chat" className="font-medium text-black text-base hover:text-[#002a63] transition-colors">
              Analyze
            </Link>
            <Link href="/submissions" className="font-medium text-black text-base hover:text-[#002a63] transition-colors">
              History
            </Link>
            <Link href="/projects" className="font-semibold text-[#002a63] text-base border-b-2 border-[#df33a8]">
              Projects
            </Link>
          </nav>
          <Link href="/chat">
            <button className="flex items-center gap-2 h-[40px] px-5 rounded-[10px] border border-[#bebebe] text-[#626262] font-medium text-sm hover:bg-[#002a63] hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Analyzer
            </button>
          </Link>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Projects</h1>
            <p className="text-white/60">Manage your projects and uploaded files</p>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-gradient-to-r from-[#002a63] to-[#df33a8] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {creating && (
          <div className="bg-white rounded-[16px] p-6 shadow-sm border border-gray-100 mb-6 space-y-3">
            <h3 className="font-semibold text-[#002a63]">New Project</h3>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Project name *"
              className="w-full border border-gray-200 rounded-[8px] px-3 py-2 text-sm outline-none focus:border-[#002a63]"
            />
            <input
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full border border-gray-200 rounded-[8px] px-3 py-2 text-sm outline-none focus:border-[#002a63]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={saving || !newName.trim()}
                className="flex items-center gap-1.5 px-5 py-2 rounded-[8px] bg-[#002a63] text-white text-sm font-semibold disabled:opacity-60"
              >
                <Check className="w-3.5 h-3.5" />
                {saving ? "Creating…" : "Create"}
              </button>
              <button
                onClick={() => { setCreating(false); setNewName(""); setNewDesc(""); }}
                className="flex items-center gap-1.5 px-5 py-2 rounded-[8px] border border-gray-200 text-gray-600 text-sm font-medium"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-[16px] p-5 text-red-600 font-medium mb-6">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white/10 rounded-[16px] h-[72px] animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && !error && projects.length === 0 && !creating && (
          <div className="text-center py-20">
            <FolderOpen className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/60 text-lg">No projects yet.</p>
            <button
              onClick={() => setCreating(true)}
              className="mt-4 px-6 py-3 rounded-[10px] bg-gradient-to-r from-[#002a63] to-[#df33a8] text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Create Your First Project
            </button>
          </div>
        )}

        <div className="space-y-3">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onDelete={(id) => setProjects((prev) => prev.filter((x) => x.id !== id))}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
