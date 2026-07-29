"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginWithToken(token: string) {
  if (!token) return { error: "Token tidak boleh kosong" };

  const supabase = await createClient();

  // Cari token di tabel voters
  const { data, error } = await supabase
    .from("voters")
    .select("id, is_voted, name")
    .eq("token", token)
    .single();

  if (error || !data) {
    return { error: "Token tidak valid atau tidak ditemukan" };
  }

  if (data.is_voted) {
    return { error: "Token ini sudah digunakan untuk memilih." };
  }

  // Set cookie session (simpan voter_id)
  const cookieStore = await cookies();
  cookieStore.set("voter_session", data.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 2, // 2 hours expiry
  });

  return { success: true };
}

export async function checkSession() {
  const cookieStore = await cookies();
  const voterId = cookieStore.get("voter_session")?.value;
  return voterId;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("voter_session");
  redirect("/");
}
