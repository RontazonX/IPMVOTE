"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { getVoterSession } from "@/utils/session";

export async function submitVote(candidateIds: string[]) {
  if (candidateIds.length !== 9) {
    return { error: "Anda harus memilih tepat 9 formatur." };
  }

  const session = await getVoterSession();
  if (!session) {
    return { error: "Sesi tidak valid atau telah berakhir. Silakan login kembali." };
  }

  const supabase = await createClient();

  // Pastikan user belum memilih (double check di server)
  const { data: existingVotes, error: checkError } = await supabase
    .from("votes")
    .select("id")
    .eq("voter_id", session.id)
    .limit(1);

  if (checkError || (existingVotes && existingVotes.length > 0)) {
    return { error: "Akses ditolak. Anda sudah memberikan suara sebelumnya." };
  }

  // Masukkan suara
  const votesData = candidateIds.map(candidate_id => ({
    election_id: session.election_id,
    voter_id: session.id,
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
    .eq("id", session.id);

  if (updateError) {
    console.error("Gagal update is_voted untuk:", session.id);
  }

  // Hapus session
  const cookieStore = await cookies();
  cookieStore.delete("voter_session");

  return { success: true };
}
