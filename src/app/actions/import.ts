"use server";

import { createClient } from "@/utils/supabase/server";
import { getAdminSession } from "@/utils/session";
import { v4 as uuidv4 } from "uuid";

export async function importVotersCsv(csvContent: string) {
  const session = await getAdminSession();
  if (!session || !session.election_id) {
    return { error: "Silakan pilih event pemilihan terlebih dahulu." };
  }

  const lines = csvContent.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) {
    return { error: "File CSV kosong." };
  }

  // Cek apakah ada header. Jika baris pertama mengandung "nama" atau "name" (case insensitive), abaikan.
  let startIndex = 0;
  if (lines[0].toLowerCase().includes("nama") || lines[0].toLowerCase().includes("name") || lines[0].toLowerCase().includes("pemilih")) {
    startIndex = 1;
  }

  const voters = [];
  const supabase = await createClient();

  for (let i = startIndex; i < lines.length; i++) {
    // CSV bisa dipisahkan koma atau titik koma
    const cols = lines[i].split(/[,;]/);
    const name = cols[0]?.trim();
    const asal = cols[1]?.trim() || "Lainnya";

    if (name) {
      const shortId = uuidv4().split("-")[0].toUpperCase();
      voters.push({
        name: name,
        asal_pimpinan: asal,
        token: shortId,
        election_id: session.election_id
      });
    }
  }

  if (voters.length === 0) {
    return { error: "Tidak ada nama pemilih yang valid ditemukan." };
  }

  const { error } = await supabase.from("voters").insert(voters);

  if (error) {
    return { error: error.message };
  }

  // Buat notifikasi (ignore if table doesn't exist)
  try {
    await supabase.from("notifications").insert([{
      title: "Import Berhasil",
      message: `Berhasil mengimport ${voters.length} pemilih.`,
      election_id: session.election_id
    }]);
  } catch (e) {}

  return { success: true, count: voters.length };
}
