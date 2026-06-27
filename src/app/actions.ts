"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSession, destroySession, requireAdmin, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { coercePrice, coerceText } from "@/lib/format";

const categories = ["디지털", "가구", "도서", "생활", "의류", "기타"];
const reportReasons = ["SCAM", "ABUSE", "PROHIBITED", "OTHER"];
const productStatuses = ["ACTIVE", "SOLD", "BLOCKED"];

export async function registerUser(formData: FormData) {
  const name = coerceText(formData.get("name"), 40);
  const email = coerceText(formData.get("email"), 120).toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email.includes("@") || password.length < 8) {
    redirect("/auth/register?error=invalid");
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    redirect("/auth/register?error=exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
  });

  await createSession(user.id);
  redirect("/");
}

export async function loginUser(formData: FormData) {
  const email = coerceText(formData.get("email"), 120).toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.blocked) {
    redirect("/auth/login?error=invalid");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    redirect("/auth/login?error=invalid");
  }

  await createSession(user.id);
  redirect("/");
}

export async function logoutUser() {
  await destroySession();
  redirect("/");
}

export async function createProduct(formData: FormData) {
  const user = await requireUser();

  if (user.blocked) {
    redirect("/sell?error=blocked");
  }

  const title = coerceText(formData.get("title"), 80);
  const description = coerceText(formData.get("description"), 1400);
  const price = coercePrice(formData.get("price"));
  const category = coerceText(formData.get("category"), 20);
  const location = coerceText(formData.get("location"), 60);
  const imageUrl =
    coerceText(formData.get("imageUrl"), 300) ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80";

  if (
    !title ||
    !description ||
    price === null ||
    !categories.includes(category) ||
    !location ||
    !imageUrl.startsWith("https://")
  ) {
    redirect("/sell?error=invalid");
  }

  const product = await prisma.product.create({
    data: {
      title,
      description,
      price,
      category,
      location,
      imageUrl,
      sellerId: user.id,
    },
  });

  revalidatePath("/");
  redirect(`/items/${product.id}`);
}

export async function sendMessage(formData: FormData) {
  const user = await requireUser();
  const productId = coerceText(formData.get("productId"), 60);
  const body = coerceText(formData.get("body"), 700);

  if (user.blocked || !productId || !body) {
    redirect(`/items/${productId}?error=message`);
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { sellerId: true, status: true },
  });

  if (!product || product.status !== "ACTIVE" || product.sellerId === user.id) {
    redirect(`/items/${productId}?error=message`);
  }

  await prisma.message.create({
    data: {
      productId,
      body,
      senderId: user.id,
      receiverId: product.sellerId,
    },
  });

  revalidatePath(`/items/${productId}`);
  redirect(`/items/${productId}?sent=1`);
}

export async function reportProduct(formData: FormData) {
  const user = await requireUser();
  const productId = coerceText(formData.get("productId"), 60);
  const reason = coerceText(formData.get("reason"), 20);
  const details = coerceText(formData.get("details"), 700);

  if (!productId || !reportReasons.includes(reason) || !details) {
    redirect(`/items/${productId}?error=report`);
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { sellerId: true },
  });

  if (!product) {
    redirect("/");
  }

  await prisma.report.create({
    data: {
      productId,
      reason: reason as "SCAM" | "ABUSE" | "PROHIBITED" | "OTHER",
      details,
      reporterId: user.id,
      reportedUserId: product.sellerId,
    },
  });

  revalidatePath(`/items/${productId}`);
  redirect(`/items/${productId}?reported=1`);
}

export async function markProductSold(formData: FormData) {
  const user = await requireUser();
  const productId = coerceText(formData.get("productId"), 60);
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { sellerId: true },
  });

  if (!product || (product.sellerId !== user.id && user.role !== "ADMIN")) {
    redirect("/");
  }

  await prisma.product.update({
    where: { id: productId },
    data: { status: "SOLD" },
  });

  revalidatePath("/");
  revalidatePath(`/items/${productId}`);
}

export async function updateProductStatus(formData: FormData) {
  await requireAdmin();
  const productId = coerceText(formData.get("productId"), 60);
  const status = coerceText(formData.get("status"), 20);

  if (!productId || !productStatuses.includes(status)) {
    redirect("/admin");
  }

  await prisma.product.update({
    where: { id: productId },
    data: { status: status as "ACTIVE" | "SOLD" | "BLOCKED" },
  });

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function toggleUserBlock(formData: FormData) {
  await requireAdmin();
  const userId = coerceText(formData.get("userId"), 60);
  const blocked = String(formData.get("blocked")) === "true";

  if (!userId) {
    redirect("/admin");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { blocked },
  });

  revalidatePath("/admin");
}

export async function resolveReport(formData: FormData) {
  await requireAdmin();
  const reportId = coerceText(formData.get("reportId"), 60);

  if (!reportId) {
    redirect("/admin");
  }

  await prisma.report.update({
    where: { id: reportId },
    data: { status: "RESOLVED" },
  });

  revalidatePath("/admin");
}
