import Cookies from "js-cookie";
import { API_BASE, isDev } from "@/config/config";

export interface VoiceConvertParams {
  voiceId: string;
  modelId?: string;
  style?: number;
  stability?: number;
  removeBackgroundNoise?: boolean;
}

/**
 * Convert audio to a different voice using ElevenLabs Speech-to-Speech
 * @param audioFile - The audio file to convert
 * @param params - Conversion parameters
 * @returns Blob containing the converted audio
 */
export async function convertVoice(
  audioFile: File,
  params: VoiceConvertParams
): Promise<Blob> {
  // Create form data
  const formData = new FormData();
  formData.append("audio", audioFile);
  formData.append("voice_id", params.voiceId);
  
  if (params.modelId) {
    formData.append("model_id", params.modelId);
  }
  
  if (params.style !== undefined) {
    formData.append("style", params.style.toString());
  }
  
  if (params.stability !== undefined) {
    formData.append("stability", params.stability.toString());
  }
  
  if (params.removeBackgroundNoise !== undefined) {
    formData.append("remove_background_noise", params.removeBackgroundNoise.toString());
  }

  const res = await fetch(`${API_BASE}/api/v1/voice/convert`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${Cookies.get("token")}`,
    },
    body: formData,
  });

  if (res.status === 401) {
    if (isDev) {
      console.error("Unauthorized");
    }
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    // Try to parse error message
    let errorMessage = "Failed to convert voice";
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // If response is not JSON, use status text
      errorMessage = res.statusText || errorMessage;
    }
    
    if (isDev) {
      console.error("Error converting voice:", errorMessage);
    }
    throw new Error(errorMessage);
  }

  // Return audio blob
  return await res.blob();
}

