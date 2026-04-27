import axios from "axios";

const BASE_URL = "https://code-efficiency.purelife-clinic.com";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { Accept: "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const raw: string =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      "Something went wrong";
    const isServerInternalError =
      /count\(\)|Argument #\d|must be of type|Undefined variable|Call to a member|Trying to access/i.test(
        raw
      );
    const message = isServerInternalError
      ? "The server encountered an internal error. Please try again later."
      : raw;
    return Promise.reject(new Error(message));
  }
);

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/api/login", { email, password });
  return data;
}

export async function apiRegister(
  name: string,
  email: string,
  password: string,
  password_confirmation: string
): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/api/register", {
    name,
    email,
    password,
    password_confirmation,
  });
  return data;
}

export async function apiLogout(): Promise<void> {
  await apiClient.post("/api/logout").catch(() => {});
}

export async function apiGetUser(): Promise<User> {
  const { data } = await apiClient.get<User>("/api/user");
  return data;
}

export function getSocialLoginUrl(provider: "google" | "facebook" | "apple"): string {
  return `${BASE_URL}/api/auth/${provider}`;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status?: string;
  created_at: string;
  updated_at?: string;
}

export async function apiGetProjects(): Promise<Project[]> {
  const { data } = await apiClient.get("/api/my-projects");
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
}

export async function apiCreateProject(name: string, description?: string): Promise<Project> {
  const { data } = await apiClient.post<Project>("/api/create-project", {
    name,
    description: description ?? "",
  });
  return data?.data ?? data;
}

export async function apiGetProject(id: number): Promise<Project> {
  const { data } = await apiClient.get(`/api/project/${id}`);
  return data?.data ?? data;
}

export async function apiUpdateProject(
  id: number,
  updates: { name?: string; description?: string; status?: string }
): Promise<Project> {
  const { data } = await apiClient.put(`/api/project/${id}`, updates);
  return data?.data ?? data;
}

export async function apiDeleteProject(id: number): Promise<void> {
  await apiClient.delete(`/api/project/${id}`);
}

export async function apiGetOrCreateDefaultProject(): Promise<number> {
  const projects = await apiGetProjects();
  if (projects.length > 0) return projects[0].id;
  const created = await apiCreateProject("My Project", "Default project for code analysis");
  return created.id;
}

export interface ProjectFile {
  id: number;
  project_id: number;
  user_id: number;
  name: string;
  path: string;
  mime_type?: string;
  size?: number;
}

export async function apiUploadFile(
  projectId: number,
  file: File
): Promise<ProjectFile> {
  const form = new FormData();
  form.append("file", file);
  form.append("project_id", String(projectId));
  const { data } = await apiClient.post("/api/upload-file", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data?.data ?? data;
}

export async function apiGetProjectFiles(projectId: number): Promise<ProjectFile[]> {
  const { data } = await apiClient.get(`/api/project/${projectId}/files`);
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
}

export async function apiDeleteFile(fileId: number): Promise<void> {
  await apiClient.delete(`/api/file/${fileId}`);
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
}

export async function apiGetConversations(): Promise<Conversation[]> {
  const { data } = await apiClient.get("/api/conversations");
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
}

export async function apiCreateConversation(title?: string): Promise<Conversation> {
  const { data } = await apiClient.post("/api/conversations", {
    title: title ?? "New Chat",
  });
  return data?.data ?? data;
}

export async function apiGetConversation(id: number): Promise<Conversation> {
  const { data } = await apiClient.get(`/api/conversation/${id}`);
  return data?.data ?? data;
}

export async function apiDeleteConversation(id: number): Promise<void> {
  await apiClient.delete(`/api/conversation/${id}`);
}

export interface Message {
  id: number;
  role: "user" | "ai";
  time: string;
  content: string;
  created_at: string;
  code_content?: string;
  conversation_id: number;
}

export async function apiGetMessages(conversationId: number): Promise<Message[]> {
  const { data } = await apiClient.get(`/api/conversation/${conversationId}/messages`);
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
}

export async function apiSendMessage(conversationId: number, content: string): Promise<Message> {
  const { data } = await apiClient.post(`/api/conversation/${conversationId}/messages`, {
    content,
    role: "user",
  });
  return data?.data ?? data;
}

export interface AnalysisResult {
  id: number;
  issues_found: unknown;
  suggestions: unknown;
  efficiency_score: number;
  optimized_code: string;
  raw_output: string;
}

export async function apiSendWithCode(
  conversationId: number,
  code: string,
  language: string,
  projectId?: number,
  message?: string
): Promise<{ submission_id?: number; message?: Message; analysis?: AnalysisResult }> {
  const form = new FormData();
  form.append("role", "user");
  form.append("content", message ?? "Please analyze the following code:");
  form.append("code_content", code);
  form.append("language", language);
  if (typeof projectId === "number" && Number.isFinite(projectId) && projectId > 0) {
    form.append("project_id", String(projectId));
  }
  if (message) form.append("message", message);
  const { data } = await apiClient.post(
    `/api/conversation/${conversationId}/messages`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export interface Submission {
  id: number;
  code_content?: string;
  language: string;
  status: "pending" | "done";
  project_id?: number;
  created_at: string;
}

export async function apiGetMySubmissions(): Promise<Submission[]> {
  const { data } = await apiClient.get("/api/my-submissions", {
    params: undefined,
  });
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
}

export async function apiGetSubmission(id: number): Promise<Submission> {
  const { data } = await apiClient.get(`/api/submission/${id}`);
  return data?.data ?? data;
}

export async function apiSubmitCode(
  code: string,
  language: string,
  projectId: number
): Promise<{ id: number }> {
  const { data } = await apiClient.post("/api/submit-code", {
    code_content: code,
    language,
    project_id: projectId,
  });
  const raw = data?.data ?? data;
  const id = raw?.id ?? raw?.submission_id;
  if (!id) throw new Error("Could not extract submission ID from response.");
  return { id };
}

export async function apiAnalyzeSubmission(submissionId: number): Promise<AnalysisResult> {
  const { data } = await apiClient.post(`/api/submission/${submissionId}/analyze`);
  return data?.data ?? data;
}

export async function apiGetAnalysisResult(submissionId: number): Promise<AnalysisResult> {
  const { data } = await apiClient.get(`/api/submission/${submissionId}/result`);
  return data?.data ?? data;
}

export async function apiSubmitAndPollResult(
  code: string,
  language: string,
  projectId: number,
  maxAttempts = 12,
  intervalMs = 3000
): Promise<AnalysisResult> {
  const submission = await apiSubmitCode(code, language, projectId);
  const submissionId = submission.id;
  await apiAnalyzeSubmission(submissionId).catch(() => {});
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((r) => setTimeout(r, intervalMs));
    try {
      const result = await apiGetAnalysisResult(submissionId);
      if (
        result &&
        (result.raw_output || result.optimized_code || result.efficiency_score !== undefined)
      ) {
        return result;
      }
    } catch {}
  }
  throw new Error("Analysis is taking longer than expected. Please try again.");
}
