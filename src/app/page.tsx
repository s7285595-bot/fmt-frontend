
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.homePage}>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          Find<span>MyTutor</span>
        </div>

        <nav className={styles.headerActions}>
          <Link href="/login" className={styles.loginButton}>
            Login
          </Link>

          <Link href="/register" className={styles.registerButton}>
            Register
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className={styles.hero}>

        <div className={styles.heroContent}>

          <div className={styles.badge}>
            ✦ Trusted Tutors • Better Learning
          </div>

          <h1>
            Find the <span>Right Tutor</span>
            <br />
            Near You
          </h1>

          <p>
            Find trusted tutors based on your location, subject,
            teaching mode, experience and budget.
          </p>

          <div className={styles.heroButtons}>
            <Link href="/register" className={styles.primaryButton}>
              Get Started
              <span>→</span>
            </Link>

            <Link href="/login" className={styles.secondaryButton}>
              Login
            </Link>
          </div>

          <div className={styles.heroFeatures}>
            <div>
              <strong>✓</strong>
              Verified Tutors
            </div>

            <div>
              <strong>✓</strong>
              Nearby Teachers
            </div>

            <div>
              <strong>✓</strong>
              Flexible Learning
            </div>
          </div>

        </div>

        {/* Right Card */}
        <div className={styles.heroCard}>

          <div className={styles.cardIcon}>
            🎓
          </div>

          <h3>Learn From The Best</h3>

          <p>
            Connect with experienced tutors who are
            ready to help you succeed.
          </p>

          <div className={styles.stats}>

            <div>
              <strong>100+</strong>
              <span>Tutors</span>
            </div>

            <div>
              <strong>10+</strong>
              <span>Subjects</span>
            </div>

            <div>
              <strong>4.8★</strong>
              <span>Rating</span>
            </div>

          </div>

        </div>

      </section>

      {/* Features */}
      <section className={styles.featuresSection}>

        <h2>
          Everything You Need to Find Your Tutor
        </h2>

        <p className={styles.sectionDescription}>
          Search, compare and connect with tutors that match
          your learning needs.
        </p>

        <div className={styles.featureGrid}>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📍</div>

            <h3>Nearby Tutors</h3>

            <p>
              Find tutors around your location with ease.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📚</div>

            <h3>Multiple Subjects</h3>

            <p>
              Choose from a wide range of subjects and skills.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>💰</div>

            <h3>Choose Your Budget</h3>

            <p>
              Find tutors according to your preferred budget.
            </p>
          </div>

        </div>

      </section>

    </main>
  );
}
