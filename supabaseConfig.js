import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL= "https://gldnngpmqpnehmpmxtsd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsZG5uZ3BtcXBuZWhtcG14dHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMDc4OTgsImV4cCI6MjA2Mjg4Mzg5OH0.kYgSrEkhp65xPq6fxuMAa76cjRZ_nAP9gaiotXL_yHE";

if (!SUPABASE_URL ||  !SUPABASE_ANON_KEY) {
    throw new Error(
        "Supabase URL ou chave não estão configuradas corretamente!"
    );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);