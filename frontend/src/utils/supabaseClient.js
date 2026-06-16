import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://khhnlkzitzxwbeygampe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoaG5sa3ppdHp4d2JleWdhbXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzODkyOTksImV4cCI6MjA5Njk2NTI5OX0.Ee2IVDjN5m3AoKnZKUOjfEhYHfJevCj7ltgVRlBqKT0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
