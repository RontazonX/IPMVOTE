"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getAppSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    return { background_type: "default", background_value: null };
  }

  return { 
    background_type: data.background_type, 
    background_value: data.background_value 
  };
}

export async function updateAppSettings(formData: FormData) {
  const background_type = formData.get("background_type") as string;
  let background_value = formData.get("background_value") as string;

  // Extract youtube ID if it's a full URL
  if (background_type === "youtube" && background_value) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = background_value.match(regExp);
    if (match && match[2].length === 11) {
      background_value = match[2];
    }
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("app_settings")
    .update({ background_type, background_value })
    .eq("id", 1);

  if (error) {
    // maybe row doesn't exist yet, insert it
    const { error: insertErr } = await supabase
      .from("app_settings")
      .insert({ id: 1, background_type, background_value });
      
    if (insertErr) return { error: insertErr.message };
  }

  revalidatePath("/");
  return { success: true };
}
