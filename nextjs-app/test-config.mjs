import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data, error } = await sb.from("platform_config").select("value").eq("key", "card_customizations").maybeSingle();
if (error) console.error("Error:", error);
else {
  const json = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
  console.log("Admin Config (PEI-Regente):", json['pei-regente']);
  console.log("Admin Config (PEI):", json['pei']);
  console.log("Admin Config (PEI Professor):", json['pei_professor']);
}
