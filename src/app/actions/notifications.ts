"use server";

import { createClient } from "@/utils/supabase/server";
import { getAdminSession } from "@/utils/session";

export async function getNotifications() {
  const session = await getAdminSession();
  if (!session) return { notifications: [] };

  const supabase = await createClient();
  
  // Try to fetch notifications, if table doesn't exist it will error safely
  try {
    let query = supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
      
    if (session.role === "admin") {
      query = query.or(`election_id.eq.${session.election_id},user_id.eq.${session.id},user_id.is.null`);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Notifications table might not exist yet:", error.message);
      return { notifications: [] };
    }
    
    return { notifications: data || [] };
  } catch (e) {
    return { notifications: [] };
  }
}

export async function markNotificationAsRead(id: string) {
  const supabase = await createClient();
  await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  return { success: true };
}

export async function markAllAsRead() {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  const supabase = await createClient();
  
  try {
    let query = supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
    
    if (session.role === "admin") {
      const { data } = await supabase.from("notifications").select("id").eq("is_read", false).or(`election_id.eq.${session.election_id},user_id.eq.${session.id},user_id.is.null`);
      if (data && data.length > 0) {
        const ids = data.map(n => n.id);
        await supabase.from("notifications").update({ is_read: true }).in("id", ids);
      }
    } else {
      await query;
    }
    return { success: true };
  } catch (e) {
    return { error: "Failed" };
  }
}

export async function createNotification(title: string, message: string, electionId?: string | null, userId?: string | null) {
  const supabase = await createClient();
  const payload: any = { title, message };
  if (electionId) payload.election_id = electionId;
  if (userId) payload.user_id = userId;
  
  try {
    await supabase.from("notifications").insert([payload]);
    return { success: true };
  } catch (e) {
    return { error: "Failed" };
  }
}
