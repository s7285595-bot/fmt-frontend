
// const API_BASE_URL = "http://localhost:8080/api";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
/* =========================
   REGISTER
========================= */

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  const response = await fetch(
    `${API_BASE_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      text || "Registration failed."
    );
  }

  return text;
}

/* =========================
   LOGIN
========================= */

export async function loginUser(data: {
  email: string;
  password: string;
}) {
  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      text || "Login failed."
    );
  }

  return text;
}

/* =========================
   NEARBY TUTORS
========================= */

export async function getNearbyTutors(
  latitude: number,
  longitude: number,
  radius: number = 5
) {
  const token =
    localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "You are not logged in."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/tutors/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const text = await response.text();

  let result: any = null;

  try {
    result = text.trim()
      ? JSON.parse(text)
      : null;
  } catch {
    result = text;
  }

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result
        : result?.message ||
          "Failed to fetch nearby tutors."
    );
  }

  return Array.isArray(result)
    ? result
    : [];
}

/* =========================
   GET TUTOR BY ID
========================= */

export async function getTutorById(
  id: number
) {
  const token =
    localStorage.getItem("token");

  const headers: HeadersInit = {};

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/tutors/${id}`,
    {
      method: "GET",
      headers,
      cache: "no-store",
    }
  );

  const text = await response.text();

  let result: any = null;

  try {
    result = text.trim()
      ? JSON.parse(text)
      : null;
  } catch {
    result = text;
  }

  console.log(
    "GET TUTOR ID:",
    id
  );

  console.log(
    "GET TUTOR STATUS:",
    response.status
  );

  console.log(
    "GET TUTOR RESPONSE:",
    result
  );

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result
        : result?.message ||
          `Failed to fetch tutor (${response.status})`
    );
  }

  if (!result) {
    throw new Error(
      "Tutor profile was not found."
    );
  }

  return result;
}

/* =========================
   GET MY TUTOR PROFILE
========================= */

export async function getMyTutorProfile() {
  const token =
    localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "You are not logged in."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/tutors/profile`,
    {
      method: "GET",
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const text = await response.text();

  let result: any = null;

  try {
    result = text.trim()
      ? JSON.parse(text)
      : null;
  } catch {
    result = text;
  }

  console.log(
    "MY TUTOR PROFILE STATUS:",
    response.status
  );

  console.log(
    "MY TUTOR PROFILE RESPONSE:",
    result
  );

  /*
   * 404 means this tutor account
   * doesn't have a profile yet.
   *
   * page.tsx will show the
   * Create Tutor Profile form.
   */

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        "Tutor profile does not exist yet."
      );
    }

    throw new Error(
      typeof result === "string"
        ? result
        : result?.message ||
          "Failed to load tutor profile."
    );
  }

  if (!result) {
    throw new Error(
      "Tutor profile was not found."
    );
  }

  return result;
}

/* =========================
   CREATE TUTOR PROFILE
========================= */

export async function createTutorProfile(
  data: {
    qualification: string;
    experience: number;
    subjects: string;
    hourlyFee: number;
    city: string;
    teachingMode: string;
    bio: string;
    latitude?: number | null;
    longitude?: number | null;
  }
) {
  const token =
    localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "You are not logged in."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/tutors/profile`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
        Authorization:
          `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  const text = await response.text();

  let result: any = null;

  try {
    result = text.trim()
      ? JSON.parse(text)
      : null;
  } catch {
    result = text;
  }

  console.log(
    "CREATE TUTOR PROFILE STATUS:",
    response.status
  );

  console.log(
    "CREATE TUTOR PROFILE RESPONSE:",
    result
  );

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result
        : result?.message ||
          "Failed to create tutor profile."
    );
  }

  if (!result) {
    throw new Error(
      "Tutor profile was created but no profile data was returned."
    );
  }

  return result;
}

/* =========================
   UPDATE TUTOR PROFILE
========================= */

export async function updateTutorProfile(
  data: {
    qualification: string;
    experience: number;
    subjects: string;
    hourlyFee: number;
    city: string;
    teachingMode: string;
    bio: string;
    latitude?: number | null;
    longitude?: number | null;
  }
) {
  const token =
    localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "You are not logged in."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/tutors/profile`,
    {
      method: "PUT",
      headers: {
        "Content-Type":
          "application/json",
        Authorization:
          `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  const text = await response.text();

  let result: any = null;

  try {
    result = text.trim()
      ? JSON.parse(text)
      : null;
  } catch {
    result = text;
  }

  console.log(
    "UPDATE TUTOR PROFILE STATUS:",
    response.status
  );

  console.log(
    "UPDATE TUTOR PROFILE RESPONSE:",
    result
  );

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result
        : result?.message ||
          "Failed to update tutor profile."
    );
  }

  return result;
}
/* =========================
   ADMIN - PENDING TUTORS
========================= */

export async function getPendingTutors() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("You are not logged in.");
  }

  const response = await fetch(
    `${API_BASE_URL}/admin/tutors/pending`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const text = await response.text();

  let result: any = null;

  try {
    result = text.trim()
      ? JSON.parse(text)
      : null;
  } catch {
    result = text;
  }

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result
        : result?.message ||
          "Failed to fetch pending tutors."
    );
  }

  return Array.isArray(result) ? result : [];
}


/* =========================
   ADMIN - APPROVE TUTOR
========================= */

export async function approveTutor(userId: number) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("You are not logged in.");
  }

  const response = await fetch(
    `${API_BASE_URL}/admin/tutors/${userId}/approve`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      text || "Failed to approve tutor."
    );
  }

  return text;
}


/* =========================
   ADMIN - REJECT TUTOR
========================= */

export async function rejectTutor(userId: number) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("You are not logged in.");
  }

  const response = await fetch(
    `${API_BASE_URL}/admin/tutors/${userId}/reject`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      text || "Failed to reject tutor."
    );
  }

  return text;
}


/* =========================
   ADMIN - ALL USERS
========================= */

export async function getAllUsers() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("You are not logged in.");
  }

  const response = await fetch(
    `${API_BASE_URL}/admin/users`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const text = await response.text();

  let result: any = null;

  try {
    result = text.trim()
      ? JSON.parse(text)
      : null;
  } catch {
    result = text;
  }

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result
        : result?.message ||
          "Failed to fetch users."
    );
  }

  return Array.isArray(result) ? result : [];
}


/* =========================
   ADMIN - SUSPEND USER
========================= */

export async function suspendUser(userId: number) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("You are not logged in.");
  }

  const response = await fetch(
    `${API_BASE_URL}/admin/users/${userId}/suspend`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      text || "Failed to suspend user."
    );
  }

  return text;
}


/* =========================
   ADMIN - BLOCK USER
========================= */

export async function blockUser(userId: number) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("You are not logged in.");
  }

  const response = await fetch(
    `${API_BASE_URL}/admin/users/${userId}/block`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      text || "Failed to block user."
    );
  }

  return text;
}



export async function createTutorRequest(
  tutorId: number,
  data: {
    subject: string;
    requestedDate: string;
    requestedTime: string;
    hours: number;
    message: string;
  }
) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("You are not logged in.");
  }

  const response = await fetch(
    `${API_BASE_URL}/requests/tutor/${tutorId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  const text = await response.text();

  let result: any = null;

  try {
    result = text.trim()
      ? JSON.parse(text)
      : null;
  } catch {
    result = text;
  }

  console.log(
    "CREATE REQUEST STATUS:",
    response.status
  );

  console.log(
    "CREATE REQUEST RESPONSE:",
    result
  );

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result
        : result?.message ||
          "Failed to send tutor request."
    );
  }

  return result;
}



/* =========================
   PARENT - MY REQUESTS
========================= */

export async function getParentRequests() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/requests/parent`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const text = await response.text();

  let result: any = null;

  try {
    result = text.trim()
      ? JSON.parse(text)
      : null;
  } catch {
    result = text;
  }

  console.log(
    "PARENT REQUESTS STATUS:",
    response.status
  );

  console.log(
    "PARENT REQUESTS:",
    result
  );

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result
        : result?.message ||
          "Unable to fetch parent requests."
    );
  }

  return Array.isArray(result)
    ? result
    : [];
}
export async function getTutorRequests() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/requests/tutor`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || "Unable to fetch tutor requests."
    );
  }

  return response.json();
}

export async function acceptTutorRequest(
  requestId: number
) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/requests/${requestId}/accept`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || "Unable to accept request."
    );
  }

  return response.text();
}

export async function rejectTutorRequest(
  requestId: number
) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/requests/${requestId}/reject`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message || "Unable to reject request."
    );
  }

  return response.text();
}
/* =========================
   PARENT - MY SESSIONS
========================= */

export async function getParentSessions() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/sessions/parent`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const text = await response.text();

  let result: any = null;

  try {
    result = text.trim()
      ? JSON.parse(text)
      : null;
  } catch {
    result = text;
  }

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result
        : result?.message ||
          "Unable to fetch your sessions."
    );
  }

  return Array.isArray(result) ? result : [];
}


/* =========================
   TUTOR - MY SESSIONS
========================= */

export async function getTutorSessions() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/sessions/tutor`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const text = await response.text();

  let result: any = null;

  try {
    result = text.trim()
      ? JSON.parse(text)
      : null;
  } catch {
    result = text;
  }

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result
        : result?.message ||
          "Unable to fetch your sessions."
    );
  }

  return Array.isArray(result) ? result : [];
}
/* =========================
   PARENT - PAY FOR SESSION
========================= */

export async function payForSession(sessionId: number) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/payments/session/${sessionId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const text = await response.text();

  let result: any = null;

  try {
    result = text.trim()
      ? JSON.parse(text)
      : null;
  } catch {
    result = text;
  }

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result
        : result?.message ||
          "Payment failed."
    );
  }

  return result;
}
/* =========================
   CHAT - GET MESSAGES
========================= */

export async function getChatMessages(sessionId: number) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/chat/${sessionId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const text = await response.text();

  let result: any = null;

  try {
    result = text.trim()
      ? JSON.parse(text)
      : null;
  } catch {
    result = text;
  }

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result
        : result?.message ||
          "Failed to load messages."
    );
  }

  return Array.isArray(result) ? result : [];
}

/* =========================
   CHAT - SEND MESSAGE
========================= */

export async function sendChatMessage(
  sessionId: number,
  message: string
) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/chat/${sessionId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message,
      }),
    }
  );

  const text = await response.text();

  let result: any = null;

  try {
    result = text.trim()
      ? JSON.parse(text)
      : null;
  } catch {
    result = text;
  }

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result
        : result?.message ||
          "Failed to send message."
    );
  }

  return result;
}


/* =========================
   CHAT - UNREAD MESSAGE COUNT
========================= */

export async function getUnreadMessageCount(): Promise<number> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/chat/unread/count`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const text = await response.text();

  let result: any = null;

  try {
    result = text.trim()
      ? JSON.parse(text)
      : null;
  } catch {
    result = text;
  }

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result
        : result?.message ||
          "Failed to get unread message count."
    );
  }

  return Number(result?.count ?? 0);
}


/* =========================
   CHAT - MARK MESSAGES READ
========================= */

export async function markChatMessagesAsRead(
  sessionId: number
): Promise<void> {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/chat/${sessionId}/read`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      text || "Failed to mark messages as read."
    );
  }
}
export async function continueWithTutor(
  sessionId: number,
  data: {
    subject: string;
    sessionDate: string;
    sessionTime: string;
    hours: number;
  }
) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please login again.");
  }

  const response = await fetch(
    `${API_BASE_URL}/requests/session/${sessionId}/continue`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        subject: data.subject,
        requestedDate: data.sessionDate,
        requestedTime: data.sessionTime,
        hours: data.hours,
      }),
    }
  );

  const text = await response.text();

  let result: any = null;

  try {
    result = text.trim() ? JSON.parse(text) : null;
  } catch {
    result = text;
  }

  if (!response.ok) {
    throw new Error(
      typeof result === "string"
        ? result
        : result?.message || "Unable to continue with tutor"
    );
  }

  return result;
}