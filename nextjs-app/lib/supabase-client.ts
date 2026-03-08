import { createClient } from '@supabase/supabase-js';

// Browser-safe Supabase client (Singleton)
// Note: Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseClientInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowser() {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn("Missing public Supabase keys for browser client");
    }

    if (!supabaseClientInstance) {
        supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey);
    }

    return supabaseClientInstance;
}
