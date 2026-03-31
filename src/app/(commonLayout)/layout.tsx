import PublicNavbar from "@/components/shared/PublicNavbar";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export default async function layout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  let user = null;
  if (accessToken) {
    try {
      user = jwt.decode(accessToken) as any;
    } catch (error) {
      console.error("JWT Decode Error in layout:", error);
    }
  }

  return (
    <>
      <PublicNavbar user={user} />
      {children}
    </>
  );
}
