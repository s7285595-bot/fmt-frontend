"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { getTutorSessions } from "@/lib/api";

type Session = {
id: number;
subject: string;
sessionDate: string;
sessionTime: string;
hours: number;
hourlyFee: number;
totalAmount: number;
status: string;

parent?: {
id: number;
name?: string;
email?: string;
};

tutor?: {
id: number;
name?: string;
email?: string;
};
};

export default function TutorSessionsPage() {
const router = useRouter();

const [sessions, setSessions] = useState<Session[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
async function loadSessions() {
try {
setLoading(true);
setError("");


    const result = await getTutorSessions();

    console.log("TUTOR SESSIONS:", result);

    setSessions(result);
  } catch (err) {
    console.error(
      "LOAD TUTOR SESSIONS ERROR:",
      err
    );

    setError(
      err instanceof Error
        ? err.message
        : "Unable to load sessions."
    );
  } finally {
    setLoading(false);
  }
}

loadSessions();


}, []);

function handleLogout() {
localStorage.removeItem("token");
router.push("/");
}

return ( <main className={styles.page}>


  {/* =========================
      HEADER
  ========================= */}

  <header className={styles.header}>

    <div
      className={styles.logo}
      onClick={() => router.push("/tutor")}
    >
      Find<span>MyTutor</span>
    </div>

    <div className={styles.headerActions}>

      <button
        type="button"
        className={styles.backButton}
        onClick={() => router.push("/tutor")}
      >
        ← Tutor Dashboard
      </button>

      <button
        type="button"
        className={styles.logoutButton}
        onClick={handleLogout}
      >
        Logout
      </button>

    </div>

  </header>


  {/* =========================
      CONTENT
  ========================= */}

  <section className={styles.container}>

    <div className={styles.pageHeader}>

      <div>
        <div className={styles.titleIcon}>
          📅
        </div>

        <div>
          <h1>My Sessions</h1>

          <p>
            View your upcoming and completed
            tutoring sessions.
          </p>
        </div>
      </div>

      <div className={styles.sessionCount}>
        {sessions.length}{" "}
        {sessions.length === 1
          ? "Session"
          : "Sessions"}
      </div>

    </div>


    {/* =========================
        LOADING
    ========================= */}

    {loading && (
      <div className={styles.loading}>

        <div className={styles.spinner}></div>

        <p>
          Loading your sessions...
        </p>

      </div>
    )}


    {/* =========================
        ERROR
    ========================= */}

    {!loading && error && (
      <div className={styles.errorBox}>

        <div className={styles.errorIcon}>
          !
        </div>

        <h2>
          Unable to load sessions
        </h2>

        <p>
          {error}
        </p>

        <button
          type="button"
          onClick={() =>
            window.location.reload()
          }
        >
          Try Again
        </button>

      </div>
    )}


    {/* =========================
        EMPTY
    ========================= */}

    {!loading &&
      !error &&
      sessions.length === 0 && (
        <div className={styles.empty}>

          <div className={styles.emptyIcon}>
            📭
          </div>

          <h2>
            No sessions yet
          </h2>

          <p>
            When you accept a parent's
            request, the session will
            appear here.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/tutor")
            }
          >
            ← View Parent Requests
          </button>

        </div>
      )}


    {/* =========================
        SESSION LIST
    ========================= */}

    {!loading &&
      !error &&
      sessions.length > 0 && (

        <div className={styles.sessionsList}>

          {sessions.map((session) => (

            <article
              key={session.id}
              className={styles.sessionCard}
            >

              {/* TOP */}

              <div className={styles.sessionTop}>

                <div>

                  <div
                    className={
                      styles.subjectLabel
                    }
                  >
                    Subject
                  </div>

                  <h2>
                    {session.subject}
                  </h2>

                </div>

                <span
                  className={`${styles.status} ${
                    session.status ===
                    "CONFIRMED"
                      ? styles.confirmed
                      : session.status ===
                        "COMPLETED"
                      ? styles.completed
                      : styles.cancelled
                  }`}
                >
                  {session.status}
                </span>

              </div>


              {/* DETAILS */}

              <div
                className={
                  styles.sessionDetails
                }
              >

                <div
                  className={
                    styles.detail
                  }
                >
                  <span>📅</span>

                  <div>
                    <small>
                      Date
                    </small>

                    <strong>
                      {session.sessionDate}
                    </strong>
                  </div>
                </div>


                <div
                  className={
                    styles.detail
                  }
                >
                  <span>⏰</span>

                  <div>
                    <small>
                      Time
                    </small>

                    <strong>
                      {session.sessionTime}
                    </strong>
                  </div>
                </div>


                <div
                  className={
                    styles.detail
                  }
                >
                  <span>⏱</span>

                  <div>
                    <small>
                      Duration
                    </small>

                    <strong>
                      {session.hours}{" "}
                      {session.hours === 1
                        ? "hour"
                        : "hours"}
                    </strong>
                  </div>
                </div>


                <div
                  className={
                    styles.detail
                  }
                >
                  <span>💰</span>

                  <div>
                    <small>
                      Total
                    </small>

                    <strong>
                      ₹
                      {Number(
                        session.totalAmount
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>
                </div>

              </div>


              {/* PARENT */}

              <div
                className={
                  styles.parentSection
                }
              >

                <div
                  className={
                    styles.parentAvatar
                  }
                >
                  👤
                </div>

                <div
                  className={
                    styles.parentDetails
                  }
                >

                  <small>
                    Parent
                  </small>

                  <strong>
                    {session.parent?.name ||
                      "Parent"}
                  </strong>

                  {session.parent?.email && (
                    <span>
                      {session.parent.email}
                    </span>
                  )}

                </div>

              </div>


              {/* FOOTER */}

              <div
                className={
                  styles.sessionFooter
                }
              >

                <span>
                  Session #{session.id}
                </span>

                <button
                  type="button"
                  className={
                    styles.chatButton
                  }
                  onClick={() =>
                    router.push(
                      `/tutor/chat/${session.id}`
                    )
                  }
                >
                  💬 Open Chat →
                </button>

              </div>

            </article>

          ))}

        </div>

      )}

  </section>

</main>


);
}
