"use server";

import { createClient } from "@/utils/supabase/server";
import { getAdminSession } from "@/utils/session";
import bcrypt from "bcryptjs";

export async function getAdmins() {
  const session = await getAdminSession();
  if (!session || session.role !== "superadmin") {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();
  const { data: admins, error } = await supabase
    .from("admins")
    .select(`
      id,
      username,
      role,
      election_id,
      elections (
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { admins };
}

export async function createAdmin(formData: FormData) {
  const session = await getAdminSession();
  if (!session || session.role !== "superadmin") {
    return { error: "Unauthorized" };
  }

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const electionId = formData.get("election_id") as string;

  if (!username || !password || !role) {
    return { error: "Semua kolom wajib diisi!" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  const payload: any = {
    username,
    password: hashedPassword,
    role,
  };

  if (role === "admin" && electionId) {
    payload.election_id = electionId;
  }

  const supabase = await createClient();
  
  // Check if username already exists
  const { data: existingUser } = await supabase.from("admins").select("id").eq("username", username).maybeSingle();
  if (existingUser) {
    return { error: "Username sudah digunakan!" };
  }

  const { error } = await supabase.from("admins").insert([payload]);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updateAdmin(id: string, formData: FormData) {
  const session = await getAdminSession();
  if (!session || session.role !== "superadmin") {
    return { error: "Unauthorized" };
  }

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const electionId = formData.get("election_id") as string;

  if (!username || !role) {
    return { error: "Username dan Role wajib diisi!" };
  }

  const payload: any = {
    username,
    role,
  };

  if (password) {
    payload.password = await bcrypt.hash(password, 10);
  }

  if (role === "admin") {
    payload.election_id = electionId || null;
  } else {
    payload.election_id = null;
  }

  const supabase = await createClient();
  
  // Check if username is used by someone else
  const { data: existingUser } = await supabase.from("admins").select("id").eq("username", username).neq("id", id).maybeSingle();
  if (existingUser) {
    return { error: "Username sudah digunakan oleh akun lain!" };
  }

  const { error } = await supabase.from("admins").update(payload).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function deleteAdmin(id: string) {
  const session = await getAdminSession();
  if (!session || session.role !== "superadmin") {
    return { error: "Unauthorized" };
  }

  // Prevent deleting oneself
  if (session.id === id) {
    return { error: "Tidak dapat menghapus akun Anda sendiri!" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("admins").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
