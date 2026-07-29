"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addVoter(name?: string) {
  const supabase = await createClient();

  const array = new Uint8Array(2);
  globalThis.crypto.getRandomValues(array);
  const randomChars = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
  const token = `WIR-${randomChars}`;
  
  const finalName = name && name.trim() !== "" ? name : `Peserta ${token}`;

  const { error } = await supabase.from("voters").insert([{
    name: finalName,
    token,
  }]);

  if (error) return { error: error.message };
  
  revalidatePath("/admin/voters");
  return { success: true, token };
}

export async function addMultipleVoters(count: number) {
  const supabase = await createClient();
  const newVoters = [];

  for (let i = 0; i < count; i++) {
    const array = new Uint8Array(2);
    globalThis.crypto.getRandomValues(array);
    const randomChars = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
    const token = `WIR-${randomChars}`;
    newVoters.push({
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
  const supabase = await createClient();
  const { error } = await supabase.from("voters").delete().eq("id", id);
  if (error) return { error: error.message };
  
  revalidatePath("/admin/voters");
  return { success: true };
}
