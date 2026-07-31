"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { checkSession } from "./auth";

export async function submitVote(candidateIds: string[]) {
  if (candidateIds.length !== 9) {
    return { error: "Anda harus memilih tepat 9 formatur." };
  }

  const voterId = await checkSession();
  if (!voterId) {
    return { error: "Sesi tidak valid atau telah berakhir. Silakan login kembali." };
  }

  const supabase = await createClient();

  // Pastikan user belum memilih (double check di server) dengan mengecek tabel votes
  const { data: existingVotes, error: checkError } = await supabase
    .from("votes")
    .select("id")
    .eq("voter_id", voterId)
    .limit(1);

  if (checkError || (existingVotes && existingVotes.length > 0)) {
    return { error: "Akses ditolak. Anda sudah memberikan suara sebelumnya." };
  }

  // Masukkan suara
  const votesData = candidateIds.map(candidate_id => ({
    voter_id: voterId,
    candidate_id
  }));

  const { error: insertError } = await supabase
    .from("votes")
    .insert(votesData);

  if (insertError) {
    return { error: "Terjadi kesalahan saat menyimpan suara. Coba lagi." };
  }

  // Update status voter
  const { error: updateError } = await supabase
    .from("voters")
    .update({ is_voted: true })
    .eq("id", voterId);

  if (updateError) {
    // Ideally we should use transactions, but Supabase standard JS client 
    // doesn't support transactions without RPC. Since it's a simple app, we just log it.
    console.error("Gagal update is_voted untuk:", voterId);
  }

  // Hapus session
  const cookieStore = await cookies();
  cookieStore.delete("voter_session");

  return { success: true };
}
