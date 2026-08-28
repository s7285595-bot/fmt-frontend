"use client";

import { useRouter } from "next/navigation";
import styles from "./TutorCard.module.css";

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

type TutorCardProps = {
  tutor: Tutor;
};

export default function TutorCard({ tutor }: TutorCardProps) {
  const router = useRouter();

  return (
    <div className={styles.card}>

      {/* Top */}
      <div className={styles.top}>

        <div className={styles.avatar}>
          👨‍🏫
        </div>

        <div className={styles.info}>
          <h3>{tutor.name}</h3>

          <p>
            {tutor.qualification}
          </p>
        </div>

        <div className={styles.rating}>
          ⭐ {tutor.rating.toFixed(1)}
        </div>

      </div>

      {/* Details */}
      <div className={styles.details}>

        <div className={styles.detail}>
          <span>📚</span>

          <div>
            <small>Subjects</small>
            <p>{tutor.subjects}</p>
          </div>
        </div>

        <div className={styles.detail}>
          <span>💼</span>

          <div>
            <small>Experience</small>
            <p>{tutor.experience} years</p>
          </div>
        </div>

        <div className={styles.detail}>
          <span>📍</span>

          <div>
            <small>Distance</small>
            <p>{tutor.distanceKm} km away</p>
          </div>
        </div>

        <div className={styles.detail}>
          <span>🎓</span>

          <div>
            <small>Teaching mode</small>
            <p>{tutor.teachingMode}</p>
          </div>
        </div>

      </div>

      {/* Bottom */}
      <div className={styles.bottom}>

        <div className={styles.fee}>
          <strong>
            ₹{tutor.hourlyFee}
          </strong>

          <span>
            / hour
          </span>
        </div>

        <button
          className={styles.viewButton}
          onClick={() =>
            router.push(`/parent/tutor/${tutor.id}`)
          }
        >
          View Profile
          <span>→</span>
        </button>

      </div>

    </div>
  );
}