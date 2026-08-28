
const API_BASE_URL = "http://localhost:8080/api";

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
