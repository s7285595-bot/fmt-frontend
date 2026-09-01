"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  getPendingTutors,
  approveTutor,
  rejectTutor,
  getAllUsers,
  suspendUser,
  blockUser,
} from "@/lib/api";
import { logout } from "@/lib/auth";
import styles from "./page.module.css";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function AdminPage() {
  const [pendingTutors, setPendingTutors] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [pending, allUsers] = await Promise.all([
        getPendingTutors(),
        getAllUsers(),
      ]);

      setPendingTutors(pending);
      setUsers(allUsers);
    } catch (err: any) {
      setError(
        err.message || "Failed to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleApprove(id: number) {
    try {
      setActionLoading(id);

      await approveTutor(id);

      await loadDashboard();
    } catch (err: any) {
      alert(err.message || "Failed to approve tutor.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id: number) {
    try {
      setActionLoading(id);

      await rejectTutor(id);

      await loadDashboard();
    } catch (err: any) {
      alert(err.message || "Failed to reject tutor.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSuspend(id: number) {
    try {
      setActionLoading(id);

      await suspendUser(id);

      await loadDashboard();
    } catch (err: any) {
      alert(err.message || "Failed to suspend user.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleBlock(id: number) {
    try {
      setActionLoading(id);

      await blockUser(id);

      await loadDashboard();
    } catch (err: any) {
      alert(err.message || "Failed to block user.");
    } finally {
      setActionLoading(null);
    }
  }

  const tutorCount = users.filter(
    (user) => user.role === "TUTOR"
  ).length;

  const parentCount = users.filter(
    (user) => user.role === "PARENT"
  ).length;

  if (loading) {
    return (
      <ProtectedRoute allowedRole="ADMIN">
        <div className={styles.loading}>
          Loading Admin Dashboard...
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRole="ADMIN">
      <div className={styles.page}>

        {/* HEADER */}

        <header className={styles.header}>
          <div>
            <h1>FindMyTutor</h1>
            <p>Admin Dashboard</p>
          </div>

          <button
            className={styles.logoutButton}
            onClick={logout}
          >
            Logout
          </button>
        </header>

        <main className={styles.container}>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {/* STATISTICS */}

          <section className={styles.stats}>

            <div className={styles.statCard}>
              <span>Total Users</span>
              <strong>{users.length}</strong>
            </div>

            <div className={styles.statCard}>
              <span>Parents</span>
              <strong>{parentCount}</strong>
            </div>

            <div className={styles.statCard}>
              <span>Tutors</span>
              <strong>{tutorCount}</strong>
            </div>

            <div className={styles.statCard}>
              <span>Pending</span>
              <strong>{pendingTutors.length}</strong>
            </div>

          </section>

          {/* PENDING TUTORS */}

          <section className={styles.section}>

            <div className={styles.sectionHeader}>
              <div>
                <h2>Pending Tutor Applications</h2>
                <p>
                  Review tutors waiting for approval.
                </p>
              </div>
            </div>

            {pendingTutors.length === 0 ? (
              <div className={styles.empty}>
                No pending tutor applications.
              </div>
            ) : (
              <div className={styles.tutorList}>

                {pendingTutors.map((tutor) => (

                  <div
                    key={tutor.id}
                    className={styles.tutorCard}
                  >

                    <div className={styles.userInfo}>

                      <div className={styles.avatar}>
                        {tutor.name
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </div>

                      <div>
                        <h3>{tutor.name}</h3>
                        <p>{tutor.email}</p>

                        <span
                          className={`${styles.badge} ${styles.pending}`}
                        >
                          {tutor.status}
                        </span>
                      </div>

                    </div>

                    <div className={styles.actions}>

                      <button
                        className={styles.approve}
                        disabled={
                          actionLoading === tutor.id
                        }
                        onClick={() =>
                          handleApprove(tutor.id)
                        }
                      >
                        {actionLoading === tutor.id
                          ? "Processing..."
                          : "Approve"}
                      </button>

                      <button
                        className={styles.reject}
                        disabled={
                          actionLoading === tutor.id
                        }
                        onClick={() =>
                          handleReject(tutor.id)
                        }
                      >
                        Reject
                      </button>

                    </div>

                  </div>

                ))}

              </div>
            )}

          </section>

          {/* ALL USERS */}

          <section className={styles.section}>

            <div className={styles.sectionHeader}>
              <div>
                <h2>All Users</h2>
                <p>
                  Manage registered users.
                </p>
              </div>
            </div>

            <div className={styles.tableWrapper}>

              <table className={styles.table}>

                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {users.map((user) => (

                    <tr key={user.id}>

                      <td>
                        <strong>{user.name}</strong>
                      </td>

                      <td>{user.email}</td>

                      <td>
                        <span className={styles.role}>
                          {user.role}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`${styles.badge} ${
                            styles[
                              user.status.toLowerCase()
                            ] || ""
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td>

                        {user.role === "ADMIN" ? (
                          <span className={styles.adminText}>
                            Admin
                          </span>
                        ) : (
                          <div className={styles.userActions}>

                            <button
                              className={styles.suspend}
                              disabled={
                                actionLoading === user.id
                              }
                              onClick={() =>
                                handleSuspend(user.id)
                              }
                            >
                              Suspend
                            </button>

                            <button
                              className={styles.block}
                              disabled={
                                actionLoading === user.id
                              }
                              onClick={() =>
                                handleBlock(user.id)
                              }
                            >
                              Block
                            </button>

                          </div>
                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </section>

        </main>

      </div>
    </ProtectedRoute>
  );
}