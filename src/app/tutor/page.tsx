
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import {getMyTutorProfile,createTutorProfile} from "../../lib/api";

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
};

type FormData = {
  qualification: string;
  experience: string;
  subjects: string;
  hourlyFee: string;
  city: string;
  teachingMode: string;
  bio: string;
};

export default function TutorPage() {
  const router = useRouter();

  const [tutor, setTutor] = useState<Tutor | null>(null);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState<FormData>({
    qualification: "",
    experience: "",
    subjects: "",
    hourlyFee: "",
    city: "",
    teachingMode: "ONLINE",
    bio: "",
  });

  /*
   * =========================
   * LOAD MY TUTOR PROFILE
   * =========================
   */

  useEffect(() => {
    async function loadMyTutorProfile() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/");
          return;
        }

        try {
          /*
           * Try to load existing tutor profile.
           */

          const result = await getMyTutorProfile();

          console.log(
            "MY TUTOR PROFILE:",
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
          });
        } catch (profileError) {
          /*
           * 404 means the user is a TUTOR
           * but has not created a tutor profile yet.
           *
           * We show the creation form instead
           * of showing an error page.
           */

          const message =
            profileError instanceof Error
              ? profileError.message
              : "";

          console.log(
            "NO TUTOR PROFILE YET:",
            message
          );

          /*
           * Do not show an error for a missing profile.
           * The creation form will be displayed.
           */

          if (
            message.includes(
              "does not exist"
            ) ||
            message.includes("not found") ||
            message.includes("404")
          ) {
            setTutor(null);
          } else {
            throw profileError;
          }
        }
      } catch (err) {
        console.error(
          "LOAD MY TUTOR ERROR:",
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

    loadMyTutorProfile();
  }, [router]);

  /*
   * =========================
   * FORM CHANGE
   * =========================
   */

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  /*
   * =========================
   * CREATE PROFILE
   * =========================
   */

  async function handleCreateProfile(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    /*
     * Basic validation
     */

    if (!formData.qualification.trim()) {
      setError(
        "Please enter your qualification."
      );
      return;
    }

    if (!formData.experience.trim()) {
      setError(
        "Please enter your experience."
      );
      return;
    }

    if (!formData.subjects.trim()) {
      setError(
        "Please enter at least one subject."
      );
      return;
    }

    if (!formData.hourlyFee.trim()) {
      setError(
        "Please enter your hourly fee."
      );
      return;
    }

    if (!formData.city.trim()) {
      setError("Please enter your city.");
      return;
    }

    const experience =
      Number(formData.experience);

    const hourlyFee =
      Number(formData.hourlyFee);

    if (
      Number.isNaN(experience) ||
      experience < 0
    ) {
      setError(
        "Experience must be a valid number."
      );
      return;
    }

    if (
      Number.isNaN(hourlyFee) ||
      hourlyFee <= 0
    ) {
      setError(
        "Hourly fee must be greater than 0."
      );
      return;
    }

    try {
      setCreating(true);

      /*
       * =========================
       * GET LOCATION
       * =========================
       */

      let latitude: number | null = null;
      let longitude: number | null = null;

      if (
        typeof navigator !== "undefined" &&
        navigator.geolocation
      ) {
        try {
          const position =
            await new Promise<GeolocationPosition>(
              (resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                  resolve,
                  reject,
                  {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                  }
                );
              }
            );

          latitude =
            position.coords.latitude;

          longitude =
            position.coords.longitude;

          console.log(
            "TUTOR LOCATION:",
            latitude,
            longitude
          );
        } catch (locationError) {
          /*
           * Location is optional.
           * Profile can still be created.
           */

          console.warn(
            "Could not get tutor location:",
            locationError
          );
        }
      }

      /*
       * =========================
       * CREATE PROFILE
       * =========================
       */

      const result =
        await createTutorProfile({
          qualification:
            formData.qualification.trim(),

          experience,

          subjects:
            formData.subjects.trim(),

          hourlyFee,

          city:
            formData.city.trim(),

          teachingMode:
            formData.teachingMode,

          bio:
            formData.bio.trim(),

          latitude,

          longitude,
        });

      console.log(
        "CREATED TUTOR PROFILE:",
        result
      );

      /*
       * Convert API response to Tutor object.
       */

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
      });

      setSuccess(
        "Your tutor profile has been created successfully!"
      );
    } catch (err) {
      console.error(
        "CREATE TUTOR PROFILE ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create tutor profile."
      );
    } finally {
      setCreating(false);
    }
  }

  /*
   * =========================
   * LOGOUT
   * =========================
   */

  function handleLogout() {
    localStorage.removeItem("token");

    router.push("/");
  }

  /*
   * =========================
   * LOADING
   * =========================
   */

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.loading}>
          <div
            className={styles.spinner}
          ></div>

          <p>
            Loading your tutor profile...
          </p>
        </div>
      </main>
    );
  }

  /*
   * =========================
   * ERROR
   * =========================
   */

  if (error && !tutor) {
    return (
      <main className={styles.page}>
        <div className={styles.errorPage}>
          <div
            className={styles.errorIcon}
          >
            !
          </div>

          <h1>
            Unable to load profile
          </h1>

          <p>{error}</p>

          <button
            type="button"
            className={styles.backButton}
            onClick={() =>
              router.push("/")
            }
          >
            ← Go Back
          </button>
        </div>
      </main>
    );
  }

  /*
   * =========================
   * CREATE PROFILE FORM
   * =========================
   */

  if (!tutor) {
    return (
      <main className={styles.page}>
        <header
          className={styles.header}
        >
          <div
            className={styles.logo}
            onClick={() =>
              router.push("/")
            }
          >
            Find<span>MyTutor</span>
          </div>

          <button
            type="button"
            className={
              styles.backHeaderButton
            }
            onClick={handleLogout}
          >
            Logout / Home
          </button>
        </header>

        <section
          className={styles.container}
        >
          <div
            className={styles.createProfile}
          >
            <div
              className={
                styles.createHeader
              }
            >
              <div
                className={styles.avatar}
              >
                👨‍🏫
              </div>

              <div>
                <div
                  className={
                    styles.verified
                  }
                >
                  ✓ Tutor Account
                </div>

                <h1>
                  Create Your Tutor Profile
                </h1>

                <p>
                  Add your teaching details
                  so parents can find you.
                </p>
              </div>
            </div>

            {error && (
              <div
                className={
                  styles.formError
                }
              >
                {error}
              </div>
            )}

            <form
              onSubmit={
                handleCreateProfile
              }
            >
              <div
                className={
                  styles.formGrid
                }
              >
                {/* QUALIFICATION */}

                <div
                  className={
                    styles.formGroup
                  }
                >
                  <label>
                    Qualification
                  </label>

                  <input
                    type="text"
                    name="qualification"
                    value={
                      formData.qualification
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="B.Tech Computer Science"
                    required
                  />
                </div>

                {/* EXPERIENCE */}

                <div
                  className={
                    styles.formGroup
                  }
                >
                  <label>
                    Experience
                  </label>

                  <input
                    type="number"
                    name="experience"
                    value={
                      formData.experience
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="5"
                    min="0"
                    required
                  />

                  <small>
                    Years of teaching
                    experience
                  </small>
                </div>

                {/* SUBJECTS */}

                <div
                  className={
                    styles.formGroup
                  }
                >
                  <label>
                    Subjects
                  </label>

                  <input
                    type="text"
                    name="subjects"
                    value={
                      formData.subjects
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Java, Spring Boot, React, AWS"
                    required
                  />

                  <small>
                    Separate subjects with
                    commas
                  </small>
                </div>

                {/* HOURLY FEE */}

                <div
                  className={
                    styles.formGroup
                  }
                >
                  <label>
                    Hourly Fee
                  </label>

                  <input
                    type="number"
                    name="hourlyFee"
                    value={
                      formData.hourlyFee
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="500"
                    min="1"
                    required
                  />

                  <small>
                    Amount in ₹ per hour
                  </small>
                </div>

                {/* CITY */}

                <div
                  className={
                    styles.formGroup
                  }
                >
                  <label>
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={
                      formData.city
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Hyderabad"
                    required
                  />
                </div>

                {/* TEACHING MODE */}

                <div
                  className={
                    styles.formGroup
                  }
                >
                  <label>
                    Teaching Mode
                  </label>

                  <select
                    name="teachingMode"
                    value={
                      formData.teachingMode
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="ONLINE">
                      Online Classes
                    </option>

                    <option value="HOME">
                      Home Classes
                    </option>

                    <option value="BOTH">
                      Online & Home Classes
                    </option>
                  </select>
                </div>

                {/* BIO */}

                <div
                  className={
                    styles.formGroupFull
                  }
                >
                  <label>
                    About You
                  </label>

                  <textarea
                    name="bio"
                    value={
                      formData.bio
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Tell parents about your teaching experience, style, and what students can expect..."
                    rows={5}
                  />
                </div>
              </div>

              <div
                className={
                  styles.locationNotice
                }
              >
                📍 We will request your
                current location to help
                parents find tutors nearby.
              </div>

              <button
                type="submit"
                className={
                  styles.createButton
                }
                disabled={creating}
              >
                {creating
                  ? "Creating Profile..."
                  : "Create Tutor Profile →"}
              </button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  /*
   * =========================
   * EXISTING PROFILE
   * =========================
   */

  const subjects = tutor.subjects
    ? tutor.subjects
        .split(",")
        .map((subject) =>
          subject.trim()
        )
        .filter(Boolean)
    : [];

  const teachingMode =
    tutor.teachingMode === "ONLINE"
      ? "Online Classes"
      : tutor.teachingMode === "HOME"
      ? "Home Classes"
      : "Online & Home Classes";

  return (
    <main className={styles.page}>
      {/* HEADER */}

      <header
        className={styles.header}
      >
        <div
          className={styles.logo}
          onClick={() =>
            router.push("/")
          }
        >
          Find<span>MyTutor</span>
        </div>

        <button
          type="button"
          className={
            styles.backHeaderButton
          }
          onClick={handleLogout}
        >
          Logout / Home
        </button>
      </header>

      {/* CONTAINER */}

      <section
        className={styles.container}
      >
        {/* PROFILE HERO */}

        <div
          className={styles.profileHero}
        >
          <div
            className={styles.profileMain}
          >
            <div
              className={styles.avatar}
            >
              👨‍🏫
            </div>

            <div
              className={styles.identity}
            >
              <div
                className={
                  styles.verified
                }
              >
                ✓ Your Tutor Profile
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
              </div>
            </div>
          </div>

          <div
            className={styles.ratingBox}
          >
            <div
              className={styles.rating}
            >
              ⭐{" "}
              {tutor.rating > 0
                ? tutor.rating.toFixed(
                    1
                  )
                : "New"}
            </div>

            <span>
              Tutor Rating
            </span>
          </div>
        </div>

        {/* SUCCESS MESSAGE */}

        {success && (
          <div
            className={
              styles.successMessage
            }
          >
            ✓ {success}
          </div>
        )}

        {/* CONTENT */}

        <div
          className={
            styles.contentGrid
          }
        >
          {/* LEFT */}

          <div
            className={
              styles.mainContent
            }
          >
            {/* ABOUT */}

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
                    About You
                  </h2>

                  <p>
                    Your tutor profile
                  </p>
                </div>
              </div>

              <p
                className={styles.bio}
              >
                {tutor.bio ||
                  "You have not added a biography yet."}
              </p>
            </section>

            {/* SUBJECTS */}

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
                  <h2>
                    Subjects
                  </h2>

                  <p>
                    Subjects you teach
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

            {/* EXPERIENCE */}

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
                    Your teaching
                    experience
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

            {/* TEACHING MODE */}

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
                    How you teach
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
                    {teachingMode}
                  </strong>

                  <span>
                    Flexible learning
                    according to student
                    requirements.
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR */}

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
                Your Hourly Rate
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
                    {teachingMode}
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

              <button
                type="button"
                className={
                  styles.contactButton
                }
                onClick={() =>
                  alert(
                    "Profile editing will be available soon."
                  )
                }
              >
                Edit Profile
                <span>→</span>
              </button>
            </div>

            {/* TRUST */}

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
                  Your tutor account is
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
