import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cbhuczhttyxhhtnmyucc.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_7v_2itUeFCjf23Qq1yv2mw_fpEmCTri';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
