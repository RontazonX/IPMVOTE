"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/utils/session";

export async function getAdminRole() {
  const session = await getAdminSession();
  return session?.role || "admin";
}

export async function getAdminElectionSettings() {
  const session = await getAdminSession();
  if (!session || !session.election_id) return { maxSelectedFormaturs: 9 };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("elections")
    .select("max_selected_formaturs")
    .eq("id", session.election_id)
    .single();

  if (error || !data) return { maxSelectedFormaturs: 9 };
  return { maxSelectedFormaturs: data.max_selected_formaturs || 9 };
}

export async function getVoterCurrentVotes(voterId: string) {
  const session = await getAdminSession();
  if (!session || session.role !== "superadmin") {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("votes")
    .select("candidate_id")
    .eq("voter_id", voterId);
    
  if (error) return { error: error.message };
  return { candidateIds: data.map(d => d.candidate_id) };
}

export async function manageVoterVotes(voterId: string, candidateIds: string[]) {
  const session = await getAdminSession();
  if (!session || session.role !== "superadmin") {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();

  const { data: voter } = await supabase
    .from("voters")
    .select("election_id")
    .eq("id", voterId)
    .single();

  if (!voter) return { error: "Pemilih tidak ditemukan." };
  const electionId = voter.election_id;

  const { data: election } = await supabase
    .from("elections")
    .select("max_selected_formaturs")
    .eq("id", electionId)
    .single();

  const maxSelectedFormaturs = election?.max_selected_formaturs || 9;

  if (candidateIds.length !== maxSelectedFormaturs) {
    return { error: `Anda harus memilih tepat ${maxSelectedFormaturs} formatur.` };
  }

  // Hapus suara lama
  const { error: deleteError } = await supabase.from("votes").delete().eq("voter_id", voterId);
  if (deleteError) {
    return { error: "Gagal menghapus suara lama: " + deleteError.message };
  }

  // Insert suara baru
  const votesData = candidateIds.map(candidate_id => ({
    election_id: electionId,
    voter_id: voterId,
    candidate_id
  }));

  const { error: insertError } = await supabase.from("votes").insert(votesData);

  if (insertError) {
    return { error: "Gagal menyimpan suara baru: " + insertError.message };
  }

  await supabase.from("voters").update({ is_voted: true }).eq("id", voterId);

  return { success: true };
}

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
