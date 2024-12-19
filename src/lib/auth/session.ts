import { getServerSession } from "next-auth";
import { authOptions } from "./auth.config";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function getSession() {
  return await getServerSession(authOptions);
} 