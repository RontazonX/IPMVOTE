import { cookies } from "next/headers";

export type AdminSession = {
  id: string;
  role: string;
  election_id: string | null;
  slug?: string;
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const sessionString = cookieStore.get("admin_session")?.value;
  if (!sessionString) return null;
  
  if (sessionString === "authenticated") {
      // Fallback for old sessions
      return { id: "", role: "admin", election_id: null };
  }

  try {
    return JSON.parse(sessionString) as AdminSession;
  } catch {
    return null;
  }
}

export type VoterSession = {
  id: string;
  election_id: string;
};

export async function getVoterSession(): Promise<VoterSession | null> {
  const cookieStore = await cookies();
  const sessionString = cookieStore.get("voter_session")?.value;
  if (!sessionString) return null;
  
  try {
    return JSON.parse(sessionString) as VoterSession;
  } catch {
    // Fallback for old sessions if needed
    return null;
  }
}
