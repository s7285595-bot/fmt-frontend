
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api";
import Link from "next/link";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const token = await loginUser({
        email,
        password,
      });

      localStorage.setItem("token", token);

      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      const role = payload.role;

    if (role === "ADMIN") {
  router.push("/admin");
} else if (role === "TUTOR") {
  router.push("/tutor");
} else if (role === "PARENT") {
  router.push("/parent");
} else {
  setError("Unknown user role");
}
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login failed"
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
          <div className={styles.icon}>🎓</div>

          <h2>
            Find the right tutor.
            <br />
            <span>Learn with confidence.</span>
          </h2>

          <p>
            Connect with trusted tutors based on your
            location, subject, budget and preferred
            teaching mode.
          </p>

          <div className={styles.points}>
            <div>
              <strong>✓</strong>
              Verified tutors
            </div>

            <div>
              <strong>✓</strong>
              Tutors near you
            </div>

            <div>
              <strong>✓</strong>
              Flexible learning options
            </div>
          </div>
        </div>
      </section>

      {/* Right side */}
      <section className={styles.rightPanel}>

        <div className={styles.loginCard}>

          <div className={styles.mobileBrand}>
            Find<span>MyTutor</span>
          </div>

          <div className={styles.heading}>
            <h1>Welcome back</h1>

            <p>
              Login to continue to your account
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className={styles.form}
          >

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

            <div className={styles.field}>
              <div className={styles.passwordLabel}>
                <label htmlFor="password">
                  Password
                </label>

                <span>
                  Forgot password?
                </span>
              </div>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={styles.loginButton}
            >
              {loading ? (
                "Logging in..."
              ) : (
                <>
                  Login
                  <span>→</span>
                </>
              )}
            </button>

          </form>

          <div className={styles.divider}>
            <span>New to FindMyTutor?</span>
          </div>

          <Link
            href="/register"
            className={styles.registerButton}
          >
            Create an account
          </Link>

          <p className={styles.bottomText}>
            By continuing, you agree to our Terms of
            Service and Privacy Policy.
          </p>

        </div>

      </section>

    </main>
  );
}
