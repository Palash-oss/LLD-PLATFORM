const BASE = 'http://localhost:3001/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Request failed');
  return json.data as T;
}

export const api = {
  getProblems: () => request<any[]>('/problems'),
  getProblem: (slug: string) => request<any>(`/problems/${slug}`),
  startAttempt: (problemId: string) =>
    request<any>('/attempts', { method: 'POST', body: JSON.stringify({ problemId }) }),
  getAttemptStatus: (id: string) => request<{ status: string }>(`/attempts/${id}/status`),
  submitAttempt: (
    id: string,
    body: {
      classDiagram: string;
      methodSignatures: string;
      responsibilities: string;
      tradeoffs: string;
      rawText?: string;
    }
  ) => request<any>(`/attempts/${id}/submit`, { method: 'POST', body: JSON.stringify(body) }),
  getFeedback: (id: string) => request<any>(`/attempts/${id}/feedback`),
  getSubmission: (id: string) => request<any>(`/attempts/${id}/submission`),
  getHistory: (learnerId: string) => request<any[]>(`/learners/${learnerId}/history`),
};
