"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getPublishResultStatus() {
  const supabase = await createClient();
  
  // Try to fetch the setting
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "publish_result")
    .single();
    
  if (error || !data) {
    // If not found (or table not initialized), assume false
    return false;
  }
  
  return data.value === "true";
}

export async function togglePublishResultStatus() {
  const supabase = await createClient();
  
  const currentStatus = await getPublishResultStatus();
  const newStatus = !currentStatus;
  
  const { error } = await supabase
    .from("settings")
    .upsert({ 
      key: "publish_result", 
      value: newStatus ? "true" : "false" 
    });
    
  if (error) {
    return { error: error.message };
  }
  
  // Revalidate the public result page and the admin page
  revalidatePath("/result");
  revalidatePath("/admin");
  
  return { success: true, status: newStatus };
}
