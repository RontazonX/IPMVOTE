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
  if (admin.password !== passwordInput) {
    return { error: "Password admin salah!" };
  }

  let slug = "";
  if (admin.role === "admin" && admin.election_id) {
    const { data: election } = await supabase
      .from("elections")
      .select("slug")
      .eq("id", admin.election_id)
      .single();
    if (election) slug = election.slug;
  }

  const sessionData = {
    id: admin.id,
    role: admin.role,
    election_id: admin.election_id,
    ...(slug ? { slug } : {}),
  };

  const cookieStore = await cookies();
  cookieStore.set("admin_session", JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  const redirectUrl = admin.role === "superadmin" ? "/admin" : `/admin-${slug}`;

  return { success: true, redirectUrl };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin-login");
}

export async function enterElection(electionId: string, slug: string) {
  const cookieStore = await cookies();
  const sessionString = cookieStore.get("admin_session")?.value;
  if (!sessionString) return { error: "Not logged in" };

  try {
    const session = JSON.parse(sessionString);
    if (session.role !== "superadmin") return { error: "Unauthorized" };

    const newSession = {
      ...session,
      election_id: electionId,
      slug: slug,
    };

    cookieStore.set("admin_session", JSON.stringify(newSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return { success: true, redirectUrl: `/admin-${slug}` };
  } catch {
    return { error: "Invalid session" };
  }
}

export async function exitElection() {
  const cookieStore = await cookies();
  const sessionString = cookieStore.get("admin_session")?.value;
  if (!sessionString) return { error: "Not logged in" };

  try {
    const session = JSON.parse(sessionString);
    if (session.role !== "superadmin") return { error: "Unauthorized" };

    const newSession = {
      ...session,
      election_id: null,
      slug: undefined,
    };

    cookieStore.set("admin_session", JSON.stringify(newSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return { success: true, redirectUrl: "/admin" };
  } catch {
    return { error: "Invalid session" };
  }
}
