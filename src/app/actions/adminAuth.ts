"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAdmin(username: string, passwordInput: string) {
  const supabase = await createClient();

  const { data: admin, error } = await supabase
    .from("admins")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !admin) {
    return { error: "Username tidak ditemukan!" };
  }

  // Dalam skenario dunia nyata, gunakan bcrypt untuk mencocokkan hash password.
  // Untuk keperluan event sederhana seperti ini sesuai skema awal:
  if (admin.password !== passwordInput) {
    return { error: "Password admin salah!" };
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_session", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return { success: true };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin-login");
}
