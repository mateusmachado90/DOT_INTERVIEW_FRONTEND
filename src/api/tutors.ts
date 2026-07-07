import { apiRequest } from "./client";

export type TutorStatus = "ACTIVE" | "INACTIVE";
export type TutorSourceType = "URL" | "JSON" | "TEXT";

export type TutorSource = {
  id: string;
  name: string;
  type: TutorSourceType;
  location: string;
  enabled: boolean;
  last_sync_at: string | null;
  created_at: string;
};

export type Tutor = {
  id: string;
  name: string;
  description: string | null;
  status: TutorStatus;
  system_prompt: string;
  sources: TutorSource[];
  created_at: string;
  updated_at: string;
};

export type TutorPayload = {
  name: string;
  description?: string | null;
  status: TutorStatus;
  system_prompt: string;
};

export type TutorChatResponse = {
  session_id: string;
  session_token: string;
  answer: string;
};

export function listTutors() {
  return apiRequest<Tutor[]>("/tutors");
}

export function getTutor(tutorId: string) {
  return apiRequest<Tutor>(`/tutors/${tutorId}`);
}

export function createTutor(payload: TutorPayload) {
  return apiRequest<Tutor>("/tutors", {
    method: "POST",
    body: payload,
  });
}

export function updateTutor(tutorId: string, payload: Partial<TutorPayload>) {
  return apiRequest<Tutor>(`/tutors/${tutorId}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteTutor(tutorId: string) {
  return apiRequest<void>(`/tutors/${tutorId}`, {
    method: "DELETE",
  });
}

export function sendTutorMessage(
  tutorId: string,
  payload: { message: string; session_token?: string },
) {
  return apiRequest<TutorChatResponse>(`/tutors/${tutorId}/chat`, {
    method: "POST",
    body: payload,
  });
}
