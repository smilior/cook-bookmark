import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const ALLOWED_EMAILS = new Set([
  "m_nakagawa@smilior.com",
  "popnstar3@gmail.com",
]);

export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export function isAllowedEmail(email: string): boolean {
  return ALLOWED_EMAILS.has(email);
}
