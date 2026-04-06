import { useEffect, useState } from "react";

type UserRole = "ADMIN" | "USER";

export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      try {
        const res = await fetch("/api/user/role", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data?.data?.role) {
            setRole(data.data.role);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user role:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRole();
  }, []);

  return loading ? null : role;
}
