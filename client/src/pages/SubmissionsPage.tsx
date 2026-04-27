import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Code2, CheckCircle2, Clock, ChevronDown, ChevronUp } from "lucide-react";
import {
  apiGetMySubmissions,
  apiGetAnalysisResult,
  type Submission,
  type AnalysisResult,
} from "@/lib/api";

function StatusBadge({ status }: { status: string }) {
  if (status === "done") {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" /> Done
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs font-semibold text-yellow-600 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full">
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
}

function SubmissionCard({ submission }: { submission: Submission }) {
  const [expanded, setExpanded] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExpand = async () => {
    if (!expanded && !result && submission.status === "done") {
      setLoading(true);
      setError(null);
      try {
        const r = await apiGetAnalysisResult(submission.id);
        setResult(r);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load result.");
      } finally {
        setLoading(false);
      }
    }
    setExpanded((v) => !v);
  };

  const date = new Date(submission.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white rounded-[16px] shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={handleExpand}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#002a63] to-[#df33a8] flex items-center justify-center shrink-0">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <div className="text-left min-w-0">
            <p className="font-semibold text-[#002a63] text-sm">
              {submission.language?.toUpperCase() ?? "Code"} Submission #{submission.id}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <StatusBadge status={submission.status} />
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          {submission.code_content && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Code
              </p>
              <pre className="bg-gray-50 rounded-[12px] p-4 text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap font-mono border border-gray-100">
                {submission.code_content}
              </pre>
            </div>
          )}

          {loading && (
            <p className="mt-4 text-sm text-gray-400 animate-pulse">Loading analysis result…</p>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-500">{error}</p>
          )}

          {result && (
            <div className="mt-4 space-y-4">
              {result.efficiency_score !== undefined && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Efficiency Score
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#002a63] to-[#df33a8] transition-all duration-700"
                        style={{ width: `${result.efficiency_score}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-[#002a63]">
                      {result.efficiency_score}/100
                    </span>
                  </div>
                </div>
              )}

              {result.raw_output && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Analysis
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{result.raw_output}</p>
                </div>
              )}

              {result.optimized_code && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Optimized Code
                  </p>
                  <pre className="bg-[#f0f4ff] rounded-[12px] p-4 text-xs text-[#002a63] overflow-x-auto whitespace-pre-wrap font-mono border border-[#002a63]/10">
                    {result.optimized_code}
                  </pre>
                </div>
              )}

              {result.suggestions && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Suggestions
                  </p>
                  {Array.isArray(result.suggestions) ? (
                    <ul className="space-y-1">
                      {(result.suggestions as string[]).map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-[#df33a8] font-bold mt-0.5">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <pre className="text-sm text-gray-700 whitespace-pre-line">
                      {JSON.stringify(result.suggestions, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}

          {submission.status === "pending" && (
            <p className="mt-4 text-sm text-yellow-600">
              Analysis is still pending. Check back soon.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    setError(null);
    apiGetMySubmissions()
      .then(setSubmissions)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load submissions."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

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
            <Link href="/submissions" className="font-semibold text-[#002a63] text-base border-b-2 border-[#df33a8]">
              History
            </Link>
            <Link href="/projects" className="font-medium text-black text-base hover:text-[#002a63] transition-colors">
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
        <h1 className="text-3xl font-bold text-white mb-2">Submission History</h1>
        <p className="text-white/60 mb-8">All your past code analysis submissions</p>

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/10 rounded-[16px] h-[72px] animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-[16px] p-5 flex items-start justify-between gap-4">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={load}
              className="shrink-0 text-sm font-semibold text-[#002a63] underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && submissions.length === 0 && (
          <div className="text-center py-20">
            <Code2 className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/60 text-lg">No submissions yet.</p>
            <Link href="/chat">
              <button className="mt-4 px-6 py-3 rounded-[10px] bg-gradient-to-r from-[#002a63] to-[#df33a8] text-white font-semibold hover:opacity-90 transition-opacity">
                Analyze Your First Code
              </button>
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {submissions.map((s) => (
            <SubmissionCard key={s.id} submission={s} />
          ))}
        </div>
      </main>
    </div>
  );
}
