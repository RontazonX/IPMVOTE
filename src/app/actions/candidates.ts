"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

export async function getCandidates() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("candidates").select("*").order("order_number", { ascending: true });
  if (error) return { error: error.message };
  return { data };
}

export async function addCandidate(formData: FormData) {
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
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage.from("photos").getPublicUrl(fileName);
    photo_url = publicUrlData.publicUrl;
  }

  const { error } = await supabase.from("candidates").insert([{
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
  const supabase = await createClient();
  const { error } = await supabase.from("candidates").delete().eq("id", id);
  if (error) return { error: error.message };
  
  revalidatePath("/admin/candidates");
  revalidatePath("/vote");
  return { success: true };
}
