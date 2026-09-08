"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/utils/session";

export async function addVoter(name?: string) {
  const session = await getAdminSession();
  if (!session || !session.election_id) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();

  const array = new Uint8Array(2);
  globalThis.crypto.getRandomValues(array);
  const randomChars = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
  const token = `VOT-${randomChars}`;
  
  const finalName = name && name.trim() !== "" ? name : `Peserta ${token}`;

  const { error } = await supabase.from("voters").insert([{
    election_id: session.election_id,
    name: finalName,
    token,
  }]);

  if (error) return { error: error.message };
  
  revalidatePath("/admin/voters");
  return { success: true, token };
}

export async function addMultipleVoters(count: number) {
  const session = await getAdminSession();
  if (!session || !session.election_id) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();
  const newVoters = [];

  for (let i = 0; i < count; i++) {
    const array = new Uint8Array(2);
    globalThis.crypto.getRandomValues(array);
    const randomChars = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
    const token = `VOT-${randomChars}`;
    newVoters.push({
      election_id: session.election_id,
      name: `Peserta ${token}`,
      token: token
    });
  }

  const { error } = await supabase.from("voters").insert(newVoters);

  if (error) return { error: error.message };
  
  revalidatePath("/admin/voters");
  return { success: true, count };
}

export async function deleteVoter(id: string) {
  const session = await getAdminSession();
  if (!session || !session.election_id) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("voters")
    .delete()
    .eq("id", id)
    .eq("election_id", session.election_id);
    
  if (error) return { error: error.message };
  revalidatePath("/admin/voters");
  return { success: true };
}

export async function deleteAllVoters() {
  const session = await getAdminSession();
  if (!session || !session.election_id) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();
  
  // Hapus semua suara terkait terlebih dahulu (jika tidak ada cascade delete)
  await supabase.from("votes").delete().eq("election_id", session.election_id);
  
  // Hapus semua pemilih
  const { error } = await supabase.from("voters").delete().eq("election_id", session.election_id);
  
  if (error) return { error: error.message };
  
  revalidatePath("/admin/voters");
  revalidatePath("/admin");
  return { success: true };
}
