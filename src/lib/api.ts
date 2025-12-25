// API configuration - update this to point to your Django backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function apiCall<T>(endpoint: string, data: Record<string, unknown>): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.detail || `Request failed: ${response.status}` };
    }

    const result = await response.json();
    return { data: result };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Network error' };
  }
}

// Types
export interface SchnorrParams {
  p: string;
  q: string;
  g: string;
}

export interface KeyPair {
  x: string;
  y: string;
}

export interface SignResult {
  k: string;
  r: string;
  h: string;
  s: string;
  y: string;
  p: string;
  q: string;
  g: string;
  x: string;
}

export interface VerifyResult {
  rp: string;
  hp: string;
  ok: boolean;
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

// API Functions
export async function generateParams(bitLengthQ: number = 160): Promise<ApiResponse<SchnorrParams>> {
  return apiCall<SchnorrParams>('/params/generate', { bit_length_q: bitLengthQ });
}

export async function validateParams(p: string, q: string, g: string): Promise<ApiResponse<ValidationResult>> {
  return apiCall<ValidationResult>('/params/validate', { p, q, g });
}

export async function generateRandomX(q: string): Promise<ApiResponse<{ x: string }>> {
  return apiCall<{ x: string }>('/key/random-x', { q });
}

export async function generateRandomKeyPair(p: string, q: string, g: string): Promise<ApiResponse<KeyPair>> {
  return apiCall<KeyPair>('/key/random', { p, q, g });
}

export async function generatePublicKey(p: string, q: string, g: string, x: string): Promise<ApiResponse<KeyPair>> {
  return apiCall<KeyPair>('/keygen', { p, q, g, x });
}

export async function signMessage(
  p: string,
  q: string,
  g: string,
  x: string,
  message: string
): Promise<ApiResponse<SignResult>> {
  return apiCall<SignResult>('/sign', { p, q, g, x, message });
}

export async function verifySignature(
  p: string,
  q: string,
  g: string,
  y: string,
  message: string,
  s: string,
  r: string,
  h: string
): Promise<ApiResponse<VerifyResult>> {
  return apiCall<VerifyResult>('/verify', { p, q, g, y, message, s, r, h });
}

export async function getSignatureFile(
  s: string,
  r: string,
  h: string,
  y: string,
  p: string,
  q: string,
  g: string
): Promise<ApiResponse<{ text: string }>> {
  return apiCall<{ text: string }>('/signature-file', { s, r, h, y, p, q, g });
}
