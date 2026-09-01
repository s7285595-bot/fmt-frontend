
"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import {
  getNearbyTutors,
  getParentRequests,
  getParentSessions,
  payForSession,
  continueWithTutor,
  getUnreadMessageCount,
} from "@/lib/api";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import TutorCard from "@/components/TutorCard";

type Tutor = {
  id: number;
  name: string;
  email: string;
  qualification: string;
  experience: number;
  subjects: string;
  hourlyFee: number;
  city: string;
  teachingMode: string;
  bio: string;
  rating: number;
  distanceKm: number;
};

type TutorRequest = {
  id: number;
  subject: string;
  requestedDate: string;
  requestedTime: string;
  hours: number;
  message: string;
  type?: string;
  status: string;
  tutor?: {
    id: number;
    user?: {
      name?: string;
      email?: string;
    };
  };
};

type Session = {
  id: number;
  subject: string;
  sessionDate: string;
  sessionTime: string;
  hours: number;
  hourlyFee: number;
  totalAmount: number;
  status: string;

  // Tutor may be missing from some backend responses
  tutor?: {
    id: number;
    user?: {
      name?: string;
      email?: string;
    };
  };

  request?: {
    id: number;
    type?: string;
  };
};

export default function ParentPage() {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [requests, setRequests] = useState<TutorRequest[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const [payingSessionId, setPayingSessionId] =
    useState<number | null>(null);

  const [continuingTutorId, setContinuingTutorId] =
    useState<number | null>(null);

  const [paymentMessage, setPaymentMessage] = useState("");

  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);

  /* =========================================================
     AUTHENTICATION
  ========================================================= */

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const parts = token.split(".");

      if (parts.length !== 3) {
        throw new Error("Invalid token");
      }

      const payload = JSON.parse(atob(parts[1]));

      if (payload.role !== "PARENT") {
        router.replace("/tutor");
        return;
      }

      setCheckingAuth(false);
    } catch {
      localStorage.removeItem("token");
      router.replace("/login");
    }
  }, [router]);

  /* =========================================================
     LOAD PARENT SESSIONS
  ========================================================= */

  useEffect(() => {
    async function loadSessions() {
      try {
        const result = await getParentSessions();

        console.log("MY PARENT SESSIONS:", result);

        setSessions(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error(
          "LOAD PARENT SESSIONS ERROR:",
          error
        );

        setSessions([]);
      } finally {
        setSessionsLoading(false);
      }
    }

    loadSessions();
  }, []);

  /* =========================================================
     LOAD PARENT REQUESTS
  ========================================================= */

  useEffect(() => {
    async function loadRequests() {
      try {
        const result = await getParentRequests();

        console.log("MY PARENT REQUESTS:", result);

        setRequests(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error(
          "LOAD PARENT REQUESTS ERROR:",
          error
        );

        setRequests([]);
      } finally {
        setRequestsLoading(false);
      }
    }

    loadRequests();
  }, []);



  /* =========================================================
   UNREAD CHAT MESSAGES
========================================================= */

useEffect(() => {
  let mounted = true;

  async function loadUnreadMessages() {
    try {
      const count = await getUnreadMessageCount();

      if (mounted) {
        setUnreadMessages(count);
      }
    } catch (error) {
      console.error(
        "LOAD UNREAD MESSAGE COUNT ERROR:",
        error
      );
    }
  }

  loadUnreadMessages();

  const interval = setInterval(
    loadUnreadMessages,
    5000
  );

  return () => {
    mounted = false;
    clearInterval(interval);
  };
}, []);
  /* =========================================================
     LOGOUT
  ========================================================= */

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  /* =========================================================
     PAYMENT
  ========================================================= */

  async function handlePayment(sessionId: number) {
    try {
      setPayingSessionId(sessionId);
      setPaymentMessage("");

      await payForSession(sessionId);

      setPaymentMessage(
        "Payment successful! Your session is now paid."
      );

      const updatedSessions =
        await getParentSessions();

      setSessions(
        Array.isArray(updatedSessions)
          ? updatedSessions
          : []
      );
    } catch (error) {
      console.error(
        "PAYMENT ERROR:",
        error
      );

      setPaymentMessage(
        error instanceof Error
          ? error.message
          : "Payment failed."
      );
    } finally {
      setPayingSessionId(null);
    }
  }

  /* =========================================================
     CONTINUE WITH TUTOR
  ========================================================= */

  async function handleContinueWithTutor(
    session: Session
  ) {
    try {
      const tutorId = session.tutor?.id;

      if (!tutorId) {
        setPaymentMessage(
          "Tutor information is missing for this session."
        );
        return;
      }

      setContinuingTutorId(tutorId);
      setPaymentMessage("");

      const result = await continueWithTutor(
        session.id,
        {
          subject: session.subject,
          sessionDate: session.sessionDate,
          sessionTime: session.sessionTime,
          hours: session.hours,
        }
      );

      console.log(
        "REGULAR SESSION REQUEST CREATED:",
        result
      );

      const updatedRequests =
        await getParentRequests();

      setRequests(
        Array.isArray(updatedRequests)
          ? updatedRequests
          : []
      );

      setPaymentMessage(
        "Your request to continue with this tutor has been sent. The tutor must accept it before the regular session is confirmed."
      );
    } catch (error) {
      console.error(
        "CONTINUE WITH TUTOR ERROR:",
        error
      );

      setPaymentMessage(
        error instanceof Error
          ? error.message
          : "Unable to continue with tutor."
      );
    } finally {
      setContinuingTutorId(null);
    }
  }

  /* =========================================================
     FIND TUTORS
  ========================================================= */

  function findTutors() {
    if (!navigator.geolocation) {
      setMessage(
        "Location is not supported by your browser."
      );
      return;
    }

    setLoading(true);
    setMessage("Getting your location...");
    setTutors([]);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        console.log(
          "PARENT LATITUDE:",
          latitude
        );

        console.log(
          "PARENT LONGITUDE:",
          longitude
        );

        try {
          setMessage(
            "Finding tutors near you..."
          );

          const result =
            await getNearbyTutors(
              latitude,
              longitude,
              25
            );

          const tutorResults =
            Array.isArray(result)
              ? result
              : [];

          setTutors(tutorResults);

          if (tutorResults.length === 0) {
            setMessage(
              "No tutors found within 25 km of your location."
            );
          } else {
            setMessage(
              `${tutorResults.length} tutor${
                tutorResults.length > 1
                  ? "s"
                  : ""
              } found near you.`
            );
          }
        } catch (error) {
          console.error(
            "FIND TUTORS ERROR:",
            error
          );

          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to find tutors."
          );
        } finally {
          setLoading(false);
        }
      },
      () => {
        setMessage(
          "Location permission was denied. Please allow location access."
        );

        setLoading(false);
      }
    );
  }

  /* =========================================================
     AUTH LOADING
  ========================================================= */

  if (checkingAuth) {
    return (
      <main className={styles.page}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            color: "#64748b",
          }}
        >
          Checking your account...
        </div>
      </main>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className={styles.page}>

      {/* ================= HEADER ================= */}

      <header className={styles.header}>
        <div className={styles.logo}>
          Find<span>MyTutor</span>
        </div>

      <div className={styles.headerRight}>
  <span className={styles.welcome}>
    Welcome, Parent
  </span>

  <button
    type="button"
    onClick={() => {
      document
        .getElementById("my-sessions")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    }}
    style={{
      position: "relative",
      border: "none",
      background: "transparent",
      fontSize: "22px",
      cursor: "pointer",
      padding: "6px 10px",
    }}
    title={
      unreadMessages > 0
        ? `${unreadMessages} unread message${
            unreadMessages > 1 ? "s" : ""
          }`
        : "No unread messages"
    }
  >
    🔔

    {unreadMessages > 0 && (
      <span
        style={{
          position: "absolute",
          top: "0px",
          right: "0px",
          minWidth: "18px",
          height: "18px",
          padding: "0 4px",
          borderRadius: "999px",
          background: "#dc2626",
          color: "white",
          fontSize: "11px",
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {unreadMessages > 99
          ? "99+"
          : unreadMessages}
      </span>
    )}
  </button>

  <button
    type="button"
    className={styles.profileButton}
    onClick={handleLogout}
    title="Logout"
  >
    👤
  </button>
         

          <button
            type="button"
            onClick={handleLogout}
            style={{
              border: "none",
              background: "transparent",
              color: "#64748b",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* ================= HERO ================= */}

      <section className={styles.hero}>

        <div className={styles.heroContent}>

          <div className={styles.badge}>
            📍 Smart tutor matching
          </div>

          <h1>
            Find the perfect
            <br />
            <span>tutor near you.</span>
          </h1>

          <p>
            Discover trusted tutors around your
            location. Filter by subject, teaching
            mode, experience and budget.
          </p>

          <button
            type="button"
            onClick={findTutors}
            disabled={loading}
            className={styles.findButton}
          >
            <span>📍</span>

            {loading
              ? "Finding Tutors..."
              : "Find Tutors Near Me"}

            <strong>→</strong>
          </button>

          {message && (
            <div className={styles.message}>
              {loading && (
                <span
                  className={styles.spinner}
                />
              )}

              {message}
            </div>
          )}

        </div>

        {/* ================= RIGHT VISUAL ================= */}

        <div className={styles.visual}>

          <div className={styles.circle} />

          <div className={styles.tutorCard}>

            <div className={styles.tutorAvatar}>
              👨‍🏫
            </div>

            <div className={styles.tutorInfo}>
              <strong>
                Verified Tutors
              </strong>

              <span>
                Ready to help your child
              </span>
            </div>

            <div className={styles.check}>
              ✓
            </div>

          </div>

          <div className={styles.locationCard}>

            <span>📍</span>

            <div>
              <strong>
                Your location
              </strong>

              <small>
                Find tutors around you
              </small>
            </div>

          </div>

        </div>

      </section>

      {/* ================= NEARBY TUTORS ================= */}

      {tutors.length > 0 && (
        <section className={styles.tutorsSection}>

          <div className={styles.sectionHeading}>

            <span>
              NEARBY TUTORS
            </span>

            <h2>
              Tutors near you
            </h2>

            <p>
              Here are tutors available within
              25 km of your location.
            </p>

          </div>

          <div className={styles.tutorGrid}>

            {tutors.map((tutor) => (
              <TutorCard
                key={tutor.id}
                tutor={tutor}
              />
            ))}

          </div>

        </section>
      )}

      {/* ================= MY REQUESTS ================= */}

      <section className={styles.requestsSection}>

        <div className={styles.sectionHeading}>

          <span>
            MY REQUESTS
          </span>

          <h2>
            Session Requests
          </h2>

          <p>
            Track the requests you have sent to tutors.
          </p>

        </div>

        {requestsLoading ? (

          <div className={styles.requestsMessage}>
            Loading your requests...
          </div>

        ) : requests.length === 0 ? (

          <div className={styles.requestsMessage}>
            You haven't sent any session requests yet.
          </div>

        ) : (

          <div className={styles.requestGrid}>

            {requests.map((request) => (

              <div
                key={request.id}
                className={styles.requestCard}
              >

                {/* REQUEST HEADER */}

                <div className={styles.requestTop}>

                  <div>

                    <span
                      className={
                        styles.requestSubject
                      }
                    >
                      📚 {request.subject}
                    </span>

                    <h3>
                      {request.tutor?.user?.name
                        ? `Tutor: ${request.tutor.user.name}`
                        : "Tutor"}
                    </h3>

                  </div>

                  <span
                    className={`${styles.requestStatus} ${
                      request.status === "ACCEPTED"
                        ? styles.accepted
                        : request.status === "REJECTED"
                        ? styles.rejected
                        : styles.pending
                    }`}
                  >
                    {request.status}
                  </span>

                </div>

                {/* REQUEST DETAILS */}

                <div
                  className={
                    styles.requestDetails
                  }
                >

                  <div>
                    📅
                    <strong>
                      Date
                    </strong>
                    <span>
                      {request.requestedDate}
                    </span>
                  </div>

                  <div>
                    🕐
                    <strong>
                      Time
                    </strong>
                    <span>
                      {request.requestedTime}
                    </span>
                  </div>

                  <div>
                    ⏱️
                    <strong>
                      Duration
                    </strong>
                    <span>
                      {request.hours} hour
                      {request.hours > 1
                        ? "s"
                        : ""}
                    </span>
                  </div>

                </div>

                {/* REQUEST TYPE */}

                {request.type && (
                  <div
                    className={
                      styles.requestFooter
                    }
                  >
                    <span>
                      {request.type === "DEMO"
                        ? "🎓 Demo Request"
                        : "📚 Regular Session Request"}
                    </span>
                  </div>
                )}

                {/* MESSAGE */}

                {request.message && (
                  <div
                    className={
                      styles.requestFooter
                    }
                  >
                    <span>
                      💬 {request.message}
                    </span>
                  </div>
                )}

              </div>

            ))}

          </div>

        )}

      </section>

      {/* ================= MY SESSIONS ================= */}

      <section
  id="my-sessions"
  className={styles.requestsSection}
>

        <div className={styles.sectionHeading}>

          <span>
            MY SESSIONS
          </span>

          <h2>
            Confirmed Sessions
          </h2>

          <p>
            Your accepted tutor sessions are shown here.
          </p>

        </div>

        {/* PAYMENT / SESSION MESSAGE */}

        {paymentMessage && (
          <div
            className={
              styles.requestsMessage
            }
          >
            {paymentMessage}
          </div>
        )}

        {sessionsLoading ? (

          <div className={styles.requestsMessage}>
            Loading your sessions...
          </div>

        ) : sessions.length === 0 ? (

          <div className={styles.requestsMessage}>
            You don't have any confirmed sessions yet.
          </div>

        ) : (

          <div className={styles.requestGrid}>

            {sessions.map((session) => {

              const sessionType =
                session.request?.type;

              const isDemo =
                session.status ===
                  "DEMO_CONFIRMED" ||
                sessionType === "DEMO";

              // IMPORTANT:
              // Tutor may not exist in some API responses.
              const tutorId =
                session.tutor?.id;

              return (
                <div
                  key={session.id}
                  className={styles.requestCard}
                >

                  {/* ================= SESSION HEADER ================= */}

                  <div className={styles.requestTop}>

                    <div>

                      <span
                        className={
                          styles.requestSubject
                        }
                      >
                        📚 {session.subject}
                      </span>

                      <h3>
                        {session.tutor?.user?.name
                          ? `Tutor: ${session.tutor.user.name}`
                          : "Confirmed Tutor"}
                      </h3>

                    </div>

                    <span
                      className={`${styles.requestStatus} ${
                        session.status === "PAID"
                          ? styles.accepted
                          : session.status ===
                              "DEMO_CONFIRMED"
                          ? styles.accepted
                          : styles.pending
                      }`}
                    >
                      {session.status}
                    </span>

                  </div>

                  {/* ================= SESSION DATE/TIME ================= */}

                  <div
                    className={
                      styles.requestDetails
                    }
                  >

                    <div>
                      📅
                      <strong>
                        Date
                      </strong>

                      <span>
                        {session.sessionDate}
                      </span>
                    </div>

                    <div>
                      🕐
                      <strong>
                        Time
                      </strong>

                      <span>
                        {session.sessionTime}
                      </span>
                    </div>

                    <div>
                      ⏱️
                      <strong>
                        Duration
                      </strong>

                      <span>
                        {session.hours} hour
                        {session.hours > 1
                          ? "s"
                          : ""}
                      </span>
                    </div>

                  </div>

                  {/* ================= PAYMENT DETAILS ================= */}

                  <div
                    className={
                      styles.requestDetails
                    }
                  >

                    <div>
                      💰
                      <strong>
                        Hourly Fee
                      </strong>

                      <span>
                        ₹
                        {Number(
                          session.hourlyFee ?? 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>

                    <div>
                      💳
                      <strong>
                        Total
                      </strong>

                      <span>
                        ₹
                        {Number(
                          session.totalAmount ?? 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>

                  </div>

                  {/* ================= SESSION ACTIONS ================= */}

                  <div
                    className={
                      styles.requestFooter
                    }
                  >

                    {/* ================= DEMO SESSION ================= */}

                    {isDemo &&
                      session.status ===
                        "DEMO_CONFIRMED" && (

                      <div
                        className={
                          styles.pendingPayment
                        }
                      >

                        <span>
                          🎓 Demo session confirmed —
                          no payment required
                        </span>

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                            marginTop: "12px",
                          }}
                        >

                          {/* CHAT */}

                          <button
                            type="button"
                            className={
                              styles.chatButton
                            }
                            onClick={() =>
                              router.push(
                                `/parent/chat/${session.id}`
                              )
                            }
                          >
                            💬 Chat with Tutor
                          </button>

                          {/* CONTINUE WITH TUTOR */}

                          <button
                            type="button"
                            className={
                              styles.payButton
                            }
                            onClick={() =>
                              handleContinueWithTutor(
                                session
                              )
                            }
                            disabled={
                              !tutorId ||
                              continuingTutorId ===
                                tutorId
                            }
                          >
                            {continuingTutorId ===
                            tutorId
                              ? "Sending..."
                              : "✓ Continue with Tutor"}
                          </button>

                        </div>

                        {/* Missing tutor warning */}

                        {!tutorId && (
                          <div
                            style={{
                              marginTop: "10px",
                              fontSize: "13px",
                              color: "#dc2626",
                            }}
                          >
                            Tutor information is unavailable
                            for this session.
                          </div>
                        )}

                      </div>
                    )}

                    {/* ================= REGULAR SESSION ================= */}

                    {!isDemo &&
                      session.status ===
                        "CONFIRMED" && (

                      <div
                        className={
                          styles.pendingPayment
                        }
                      >

                        <span>
                          ✓ Your session is confirmed
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handlePayment(
                              session.id
                            )
                          }
                          disabled={
                            payingSessionId ===
                            session.id
                          }
                          className={
                            styles.payButton
                          }
                        >
                          {payingSessionId ===
                          session.id
                            ? "Processing..."
                            : `💳 Pay ₹${Number(
                                session.totalAmount ?? 0
                              ).toLocaleString(
                                "en-IN"
                              )}`}
                        </button>

                      </div>
                    )}

                    {/* ================= PAID ================= */}

                    {session.status === "PAID" && (

                      <div
                        className={
                          styles.paidSection
                        }
                      >

                        <span>
                          ✓ Payment completed
                        </span>

                        <button
                          type="button"
                          className={
                            styles.chatButton
                          }
                          onClick={() =>
                            router.push(
                              `/parent/chat/${session.id}`
                            )
                          }
                        >
                          💬 Chat with Tutor
                        </button>

                      </div>
                    )}

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </section>

      {/* ================= FEATURES ================= */}

      <section className={styles.features}>

        <div className={styles.sectionHeading}>

          <span>
            HOW IT WORKS
          </span>

          <h2>
            Finding a tutor is simple
          </h2>

          <p>
            We make it easy for parents to find
            the right tutor for their child.
          </p>

        </div>

        <div className={styles.featureGrid}>

          <div className={styles.featureCard}>

            <div className={styles.featureIcon}>
              📍
            </div>

            <h3>
              Find Nearby
            </h3>

            <p>
              Discover tutors close to
              your location.
            </p>

          </div>

          <div className={styles.featureCard}>

            <div className={styles.featureIcon}>
              🔎
            </div>

            <h3>
              Compare Tutors
            </h3>

            <p>
              Compare subjects, experience,
              ratings and hourly fees.
            </p>

          </div>

          <div className={styles.featureCard}>

            <div className={styles.featureIcon}>
              🎓
            </div>

            <h3>
              Start Learning
            </h3>

            <p>
              Choose a tutor and start your
              child's learning journey.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}

