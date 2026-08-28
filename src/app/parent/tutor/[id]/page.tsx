"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import { getTutorById } from "@/lib/api";

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
distanceKm?: number;
};

export default function TutorProfilePage() {
const params = useParams<{ id: string }>();
const router = useRouter();

const [tutor, setTutor] = useState<Tutor | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
async function loadTutor() {
try {
setLoading(true);
setError("");


    console.log("PARAMS:", params);

    const tutorId = Number(params.id);

    console.log("TUTOR ID PARAM:", tutorId);

    if (!Number.isInteger(tutorId) || tutorId <= 0) {
      setError("Invalid tutor ID.");
      return;
    }

    console.log(
      "FETCHING TUTOR:",
      tutorId
    );

    const result = await getTutorById(tutorId);

    console.log(
      "TUTOR RECEIVED:",
      result
    );

    setTutor({
      id: Number(result.id),
      name: result.name ?? "Tutor",
      email: result.email ?? "",
      qualification:
        result.qualification ?? "",
      experience:
        Number(result.experience ?? 0),
      subjects:
        result.subjects ?? "",
      hourlyFee:
        Number(result.hourlyFee ?? 0),
      city:
        result.city ?? "",
      teachingMode:
        result.teachingMode ?? "ONLINE",
      bio:
        result.bio ?? "",
      rating:
        Number(result.rating ?? 0),
      distanceKm:
        result.distanceKm !== undefined
          ? Number(result.distanceKm)
          : undefined,
    });
  } catch (err) {
    console.error(
      "LOAD TUTOR ERROR:",
      err
    );

    setError(
      err instanceof Error
        ? err.message
        : "Unable to load tutor profile."
    );
  } finally {
    setLoading(false);
  }
}

loadTutor();


}, [params.id]);

if (loading) {
return ( <main className={styles.page}> <div className={styles.loading}> <div className={styles.spinner}></div>


      <p>
        Loading tutor profile...
      </p>
    </div>
  </main>
);


}

if (error || !tutor) {
return ( <main className={styles.page}> <div className={styles.errorPage}> <div className={styles.errorIcon}>
! </div>

      <h1>
        Unable to load tutor
      </h1>

      <p>
        {error ||
          "Tutor profile not found."}
      </p>

      <button
        type="button"
        className={styles.backButton}
        onClick={() =>
          router.push("/parent")
        }
      >
        ← Back to Tutors
      </button>
    </div>
  </main>
);


}

const subjects = tutor.subjects
? tutor.subjects
.split(",")
.map(
(subject) =>
subject.trim()
)
.filter(Boolean)
: [];

const teachingModeLabel =
tutor.teachingMode === "ONLINE"
? "Online Classes"
: tutor.teachingMode === "HOME"
? "Home Classes"
: "Online & Home Classes";

return ( <main className={styles.page}> <header className={styles.header}>
<div
className={styles.logo}
onClick={() =>
router.push("/parent")
}
>
Find<span>MyTutor</span> </div>


    <button
      type="button"
      className={
        styles.backHeaderButton
      }
      onClick={() =>
        router.push("/parent")
      }
    >
      ← Back to Tutors
    </button>
  </header>

  <section className={styles.container}>
    <div className={styles.breadcrumb}>
      <button
        type="button"
        onClick={() =>
          router.push("/parent")
        }
      >
        Find Tutors
      </button>

      <span>›</span>

      <span>{tutor.name}</span>
    </div>

    <div
      className={styles.profileHero}
    >
      <div
        className={styles.profileMain}
      >
        <div className={styles.avatar}>
          👨‍🏫
        </div>

        <div className={styles.identity}>
          <div
            className={styles.verified}
          >
            ✓ Verified Tutor
          </div>

          <h1>{tutor.name}</h1>

          <p
            className={
              styles.qualification
            }
          >
            {tutor.qualification ||
              "Professional Tutor"}
          </p>

          <div
            className={
              styles.location
            }
          >
            📍{" "}
            {tutor.city ||
              "Location not specified"}

            {tutor.distanceKm !==
              undefined && (
              <span>
                {" "}
                •{" "}
                {tutor.distanceKm} km
                away
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        className={styles.ratingBox}
      >
        <div
          className={styles.rating}
        >
          {tutor.rating > 0
            ? `⭐ ${tutor.rating.toFixed(1)}`
            : "New"}
        </div>

        <span>
          Tutor Rating
        </span>
      </div>
    </div>

    <div
      className={
        styles.contentGrid
      }
    >
      <div
        className={
          styles.mainContent
        }
      >
        <section
          className={styles.section}
        >
          <div
            className={
              styles.sectionTitle
            }
          >
            <span
              className={
                styles.titleIcon
              }
            >
              👋
            </span>

            <div>
              <h2>
                About the Tutor
              </h2>

              <p>
                Get to know your
                tutor
              </p>
            </div>
          </div>

          <p
            className={styles.bio}
          >
            {tutor.bio ||
              "This tutor has not added a biography yet."}
          </p>
        </section>

        <section
          className={styles.section}
        >
          <div
            className={
              styles.sectionTitle
            }
          >
            <span
              className={
                styles.titleIcon
              }
            >
              📚
            </span>

            <div>
              <h2>Subjects</h2>

              <p>
                Subjects this tutor
                teaches
              </p>
            </div>
          </div>

          <div
            className={styles.subjects}
          >
            {subjects.length > 0 ? (
              subjects.map(
                (subject) => (
                  <span
                    key={subject}
                    className={
                      styles.subject
                    }
                  >
                    ✓ {subject}
                  </span>
                )
              )
            ) : (
              <span>
                No subjects added
              </span>
            )}
          </div>
        </section>

        <section
          className={styles.section}
        >
          <div
            className={
              styles.sectionTitle
            }
          >
            <span
              className={
                styles.titleIcon
              }
            >
              💼
            </span>

            <div>
              <h2>
                Experience
              </h2>

              <p>
                Teaching experience
              </p>
            </div>
          </div>

          <div
            className={
              styles.experienceBox
            }
          >
            <strong>
              {tutor.experience}
            </strong>

            <span>
              {" "}
              years of teaching
              experience
            </span>
          </div>
        </section>

        <section
          className={styles.section}
        >
          <div
            className={
              styles.sectionTitle
            }
          >
            <span
              className={
                styles.titleIcon
              }
            >
              🎓
            </span>

            <div>
              <h2>
                Teaching Mode
              </h2>

              <p>
                How you can learn
              </p>
            </div>
          </div>

          <div
            className={
              styles.modeCard
            }
          >
            <div
              className={
                styles.modeIcon
              }
            >
              {tutor.teachingMode ===
              "ONLINE"
                ? "💻"
                : tutor.teachingMode ===
                  "HOME"
                ? "🏠"
                : "🔄"}
            </div>

            <div>
              <strong>
                {teachingModeLabel}
              </strong>

              <span>
                Flexible learning
                according to your
                requirements.
              </span>
            </div>
          </div>
        </section>
      </div>

      <aside
        className={styles.sidebar}
      >
        <div
          className={
            styles.bookingCard
          }
        >
          <span
            className={
              styles.priceLabel
            }
          >
            Hourly rate
          </span>

          <div
            className={styles.price}
          >
            ₹
            {tutor.hourlyFee.toLocaleString(
              "en-IN"
            )}

            <span>
              / hour
            </span>
          </div>

          <div
            className={
              styles.divider
            }
          />

          <div
            className={
              styles.infoRow
            }
          >
            <span>📍</span>

            <div>
              <strong>
                Location
              </strong>

              <small>
                {tutor.city ||
                  "Not specified"}
              </small>
            </div>
          </div>

          <div
            className={
              styles.infoRow
            }
          >
            <span>🎓</span>

            <div>
              <strong>
                Teaching
              </strong>

              <small>
                {teachingModeLabel}
              </small>
            </div>
          </div>

          <div
            className={
              styles.infoRow
            }
          >
            <span>💼</span>

            <div>
              <strong>
                Experience
              </strong>

              <small>
                {tutor.experience}{" "}
                years
              </small>
            </div>
          </div>

          {tutor.distanceKm !==
            undefined && (
            <div
              className={
                styles.infoRow
              }
            >
              <span>📏</span>

              <div>
                <strong>
                  Distance
                </strong>

                <small>
                  {
                    tutor.distanceKm
                  }{" "}
                  km away
                </small>
              </div>
            </div>
          )}

          <button
            type="button"
            className={
              styles.contactButton
            }
            onClick={() =>
              alert(
                "Booking feature will be available soon."
              )
            }
          >
            Request a Session

            <span>→</span>
          </button>

          <p
            className={
              styles.bookingNote
            }
          >
            You can request a
            session with this
            tutor and discuss
            your learning
            requirements.
          </p>
        </div>

        <div
          className={
            styles.trustCard
          }
        >
          <div
            className={
              styles.trustIcon
            }
          >
            ✓
          </div>

          <div>
            <strong>
              Verified Tutor
            </strong>

            <p>
              This tutor is
              registered with
              FindMyTutor.
            </p>
          </div>
        </div>
      </aside>
    </div>
  </section>
</main>


);
}
