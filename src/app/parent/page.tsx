
"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { getNearbyTutors } from "@/lib/api";
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

export default function ParentPage() {
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  /* =========================
     AUTHENTICATION
  ========================= */

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

      const payload = JSON.parse(
        atob(parts[1])
      );

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

  /* =========================
     LOGOUT
  ========================= */

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  /* =========================
     FIND TUTORS
  ========================= */

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

          setTutors(result);

          if (result.length === 0) {

            setMessage(
              "No tutors found within 25 km of your location."
            );

          } else {

            setMessage(
              `${result.length} tutor${
                result.length > 1
                  ? "s"
                  : ""
              } found near you.`
            );

          }

        } catch (error) {

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

  /* =========================
     AUTH LOADING
  ========================= */

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

  /* =========================
     PAGE
  ========================= */

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
                ></span>
              )}

              {message}

            </div>
          )}

        </div>


        {/* ================= RIGHT VISUAL ================= */}

        <div className={styles.visual}>

          <div className={styles.circle}></div>

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
