"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { getAdminSession, getVoterSession } from "@/utils/session";

export async function getCandidates() {
  const adminSession = await getAdminSession();
  const voterSession = await getVoterSession();
  
  // Try admin session first, fallback to voter session
  const electionId = adminSession?.election_id || voterSession?.election_id;

  if (!electionId) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("election_id", electionId)
    .order("order_number", { ascending: true });
    
  if (error) return { error: error.message };
  return { data };
}

export async function addCandidate(formData: FormData) {
  const session = await getAdminSession();
  if (!session || !session.election_id) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();
  
  const name = formData.get("name") as string;
  const no = parseInt(formData.get("no") as string);
  const asal_pimpinan = formData.get("asal_pimpinan") as string;
  const photo = formData.get("photo") as File;
  
  if (!name || isNaN(no) || !asal_pimpinan) return { error: "Nama, Nomor Urut, dan Asal Pimpinan wajib diisi." };

  let photo_url = null;

  if (photo && photo.size > 0) {
    const fileExt = photo.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(fileName, photo, {
        cacheControl: "3600",
        upsert: false
      });
      
    if (uploadError) return { error: "Gagal upload foto: " + uploadError.message };
    
    const { data: publicUrlData } = supabase.storage.from("photos").getPublicUrl(fileName);
    photo_url = publicUrlData.publicUrl;
  }

  const { error } = await supabase.from("candidates").insert([{
    election_id: session.election_id,
    name,
    order_number: no,
    asal_pimpinan,
    photo_url,
  }]);

  if (error) return { error: error.message };
  
  revalidatePath("/admin/candidates");
  revalidatePath("/vote");
  return { success: true };
}

export async function deleteCandidate(id: string) {
  const session = await getAdminSession();
  if (!session || !session.election_id) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("candidates")
    .delete()
    .eq("id", id)
    .eq("election_id", session.election_id); // Prevent deleting other elections' candidates
    
  if (error) return { error: error.message };
  
  revalidatePath("/admin/candidates");
  revalidatePath("/vote");
  return { success: true };
}
