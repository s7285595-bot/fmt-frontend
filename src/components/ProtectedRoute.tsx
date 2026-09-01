"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: "PARENT" | "TUTOR" | "ADMIN";
}

export default function ProtectedRoute({
  children,
  allowedRole,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // No token → login
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      const role = payload.role;

      // Role doesn't match
      if (allowedRole && role !== allowedRole) {
        router.replace("/login");
        return;
      }

      setChecking(false);
    } catch {
      localStorage.removeItem("token");
      router.replace("/login");
    }
  }, [router, allowedRole]);

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Checking authentication...
      </div>
    );
  }

  return <>{children}</>;
}