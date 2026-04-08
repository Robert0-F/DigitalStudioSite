import { cookies } from "next/headers";

export async function requireAdminSession() {
  const v = (await cookies()).get("admin_session");
  if (!v || v.value !== "1") {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }
}

