"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/utils/session";

export async function getAdminElectionInfo() {
  const session = await getAdminSession();
  if (!session || !session.election_id) {
    return { error: "Unauthorized" };
  }
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("elections")
    .select("*")
    .eq("id", session.election_id)
    .single();
    
  if (error || !data) return { error: "Election not found" };
  return { election: data };
}

export async function togglePublishResultStatus() {
  const session = await getAdminSession();
  if (!session || !session.election_id) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("elections")
    .select("is_result_published, slug")
    .eq("id", session.election_id)
    .single();

  if (!data) return { error: "Election not found" };

  const newStatus = !data.is_result_published;
  
  const { error } = await supabase
    .from("elections")
    .update({ is_result_published: newStatus })
    .eq("id", session.election_id);
    
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath(`/result/${data.slug}`);
  revalidatePath("/admin");
  
  return { success: true, status: newStatus };
}

export async function resetElection() {
  const session = await getAdminSession();
  if (!session || !session.election_id) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();
  
  const { error: errorVotes } = await supabase
    .from("votes")
    .delete()
    .eq("election_id", session.election_id);
  if (errorVotes) return { error: errorVotes.message };

  const { error: errorVoters } = await supabase
    .from("voters")
    .update({ is_voted: false })
    .eq("election_id", session.election_id);
  if (errorVoters) return { error: errorVoters.message };

  revalidatePath("/admin");
  return { success: true };
}

export async function getVoterElectionInfo(electionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("elections")
    .select("name, max_selected_formaturs")
    .eq("id", electionId)
    .single();
    
  if (error || !data) return null;
  return data;
}

// === SUPERADMIN ACTIONS ===

export async function getAllElections() {
  const session = await getAdminSession();
  if (!session || session.role !== 'superadmin') {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("elections")
    .select("*, admins(id, username)")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { elections: data };
}

export async function createElectionAndAdmin(name: string, slug: string, adminUsername: string, adminPassword: string, level: string = 'Pimpinan Ranting', maxSelectedFormaturs: number = 9) {
  const session = await getAdminSession();
  if (!session || session.role !== 'superadmin') {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();

  // 1. Create Election
  const { data: election, error: electionError } = await supabase
    .from("elections")
    .insert({ name, slug, level, max_selected_formaturs: maxSelectedFormaturs })
    .select("id")
    .single();

  if (electionError) {
    return { error: "Gagal membuat election. Mungkin slug sudah digunakan." };
  }

  // 2. Create Admin
  const { error: adminError } = await supabase
    .from("admins")
    .insert({
      username: adminUsername,
      password: adminPassword,
      role: 'admin',
      election_id: election.id
    });

  if (adminError) {
    return { error: "Gagal membuat admin. Username mungkin sudah digunakan." };
  }

  revalidatePath("/admin/elections");
  return { success: true };
}

export async function getSuperadminDashboardStats() {
  const session = await getAdminSession();
  if (!session || session.role !== 'superadmin') {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();

  // Get all elections
  const { data: elections, error } = await supabase
    .from("elections")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !elections) return { error: error?.message || "Failed to fetch elections" };

  // Get voter counts per election
  const { data: voters } = await supabase
    .from("voters")
    .select("election_id, is_voted");

  const { data: candidates } = await supabase
    .from("candidates")
    .select("election_id");

  const stats = elections.map(election => {
    const electionVoters = (voters || []).filter(v => v.election_id === election.id);
    const totalVoters = electionVoters.length;
    const votedVoters = electionVoters.filter(v => v.is_voted).length;
    
    const totalCandidates = (candidates || []).filter(c => c.election_id === election.id).length;

    return {
      id: election.id,
      name: election.name,
      slug: election.slug,
      is_result_published: election.is_result_published,
      totalVoters,
      votedVoters,
      totalCandidates
    };
  });

  return { stats };
}
