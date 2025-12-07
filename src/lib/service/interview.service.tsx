import Cookies from "js-cookie";
import { API_BASE, isDev } from "@/config/config";

export interface AgentTokenResponse {
  token: string;
  agent_id: string;
  llm_endpoint: string;
  session_id: string;
}

export interface InterviewSession {
  id: string;
  task_id: string;
  status: "active" | "completed" | "paused";
  started_at: string;
}

/**
 * Get agent token and configuration from backend
 * This is called BEFORE connecting to ElevenLabs Agent
 */
export async function getAgentToken(taskId: string): Promise<AgentTokenResponse> {
  const res = await fetch(`${API_BASE}/api/v1/interviews/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Cookies.get("token")}`,
    },
    body: JSON.stringify({
      task_id: taskId,
    }),
  });

  const data = await res.json();

  switch (res.status) {
    case 200:
      if (isDev) {
        console.log("Agent token received:", data);
      }
      return {
        token: data.token,
        agent_id: data.agent_id,
        llm_endpoint: data.llm_endpoint,
        session_id: data.session_id,
      };
    case 401:
      if (isDev) {
        console.error("Unauthorized:", data);
      }
      throw new Error("UNAUTHORIZED");
    default:
      if (isDev) {
        console.error("Error getting agent token:", data);
      }
      throw new Error(data.errorCode || "UNKNOWN_ERROR");
  }
}

/**
 * End interview session
 */
export async function endInterview(sessionId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/v1/interviews/${sessionId}/end`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Cookies.get("token")}`,
    },
  });

  // Handle non-JSON responses
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    console.error("Non-JSON response:", text);
    throw new Error(`Server returned non-JSON response: ${res.status}`);
  }

  const data = await res.json();

  if (res.status !== 200) {
    if (isDev) {
      console.error("Error ending interview:", data);
    }
    throw new Error(data.errorCode || data.error || "UNKNOWN_ERROR");
  }

  return data; // Return transcript and evaluation
}
/**
 * Submit code during interview
 */
export async function submitCodeDuringInterview(
  sessionId: string,
  code: string,
  language: string
): Promise<any> {
  const res = await fetch(`${API_BASE}/api/v1/interviews/${sessionId}/submit-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Cookies.get("token")}`,
    },
    body: JSON.stringify({
      code,
      language,
    }),
  });

  const data = await res.json();

  if (res.status === 200) {
    return data;
  } else {
    if (isDev) {
      console.error("Error submitting code:", data);
    }
    throw new Error(data.errorCode || "UNKNOWN_ERROR");
  }
}

/**
 * Save agent response message to backend
 */
export async function saveAgentResponse(sessionId: string, message: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/v1/interviews/${sessionId}/response`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Cookies.get("token")}`,
    },
    body: JSON.stringify({
      message,
    }),
  });

  const data = await res.json();

  if (res.status !== 200) {
    if (isDev) {
      console.error("Error saving agent response message:", data);
    }
    throw new Error(data.errorCode || data.error || "UNKNOWN_ERROR");
  }

  // Check if we should end the interview
  if (data.should_end) {
    console.log('Interview reached 3 messages, should end');
    // Return a flag so the caller can handle ending
    return { ...data, shouldEndInterview: true };
  }

  return data;
}