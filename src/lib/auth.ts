import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";

const COOKIE_NAME = "secure_market_session";
const SESSION_DAYS = 7;

type AuthUser = {
  id: string;
  name: string;
  email: string;
  walletBalance: number;
  role: "USER" | "ADMIN";
  blocked: boolean;
};

function sessionSecret() {
  return process.env.SESSION_SECRET ?? "replace-this-development-secret-before-deploy";
}

function hashToken(token: string) {
  return createHmac("sha256", sessionSecret()).update(token).digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export async function createSession(userId: string) {
  const cookieStore = await cookies();
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      tokenHash,
      expiresAt,
      userId,
    },
  });

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: { tokenHash: hashToken(token) },
    });
  }

  cookieStore.delete(COOKIE_NAME);
}

export async function currentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const tokenHash = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    await prisma.session.deleteMany({ where: { tokenHash } });
    cookieStore.delete(COOKIE_NAME);
    return null;
  }

  if (!safeEqual(session.tokenHash, tokenHash)) {
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    walletBalance: session.user.walletBalance,
    role: session.user.role,
    blocked: session.user.blocked,
  };
}

export async function requireUser() {
  const user = await currentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return user;
}
