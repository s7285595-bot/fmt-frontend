
"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/api";
import Link from "next/link";
import styles from "./page.module.css";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PARENT");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await registerUser({
        name,
        email,
        password,
        role,
      });

      router.push("/login");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>

      {/* Left side */}
      <section className={styles.leftPanel}>

        <div className={styles.brand}>
          Find<span>MyTutor</span>
        </div>

        <div className={styles.leftContent}>

          <div className={styles.icon}>
            🎓
          </div>

          <h2>
            Start your
            <br />
            <span>learning journey.</span>
          </h2>

          <p>
            Create your account and discover trusted
            tutors who match your needs, location,
            subject and budget.
          </p>

          <div className={styles.points}>

            <div>
              <strong>✓</strong>
              Find tutors near you
            </div>

            <div>
              <strong>✓</strong>
              Compare experience and fees
            </div>

            <div>
              <strong>✓</strong>
              Choose online or home tutoring
            </div>

          </div>

        </div>

      </section>

      {/* Right side */}
      <section className={styles.rightPanel}>

        <div className={styles.card}>

          <div className={styles.mobileBrand}>
            Find<span>MyTutor</span>
          </div>

          <div className={styles.heading}>
            <h1>Create your account</h1>

            <p>
              Join FindMyTutor and get started today.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className={styles.form}
          >

            {/* Name */}
            <div className={styles.field}>
              <label htmlFor="name">
                Full name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email */}
            <div className={styles.field}>
              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password */}
            <div className={styles.field}>
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Create a password"
                required
              />
            </div>

            {/* Account type */}
            <div className={styles.field}>

              <label>
                I want to
              </label>

              <div className={styles.roleGrid}>

                <button
                  type="button"
                  className={`${styles.roleCard} ${
                    role === "PARENT"
                      ? styles.roleActive
                      : ""
                  }`}
                  onClick={() =>
                    setRole("PARENT")
                  }
                >
                  <span>👨‍👩‍👧</span>

                  <div>
                    <strong>Find a Tutor</strong>
                    <small>Parent</small>
                  </div>

                  {role === "PARENT" && (
                    <b>✓</b>
                  )}
                </button>

                <button
                  type="button"
                  className={`${styles.roleCard} ${
                    role === "TUTOR"
                      ? styles.roleActive
                      : ""
                  }`}
                  onClick={() =>
                    setRole("TUTOR")
                  }
                >
                  <span>👨‍🏫</span>

                  <div>
                    <strong>Teach Students</strong>
                    <small>Tutor</small>
                  </div>

                  {role === "TUTOR" && (
                    <b>✓</b>
                  )}
                </button>

              </div>

            </div>

            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={styles.registerButton}
            >
              {loading
                ? "Creating account..."
                : "Create Account"}

              {!loading && <span>→</span>}
            </button>

          </form>

          <p className={styles.loginText}>
            Already have an account?{" "}
            <Link href="/login">
              Login
            </Link>
          </p>

          <p className={styles.terms}>
            By creating an account, you agree to our
            Terms of Service and Privacy Policy.
          </p>

        </div>

      </section>

    </main>
  );
              }
