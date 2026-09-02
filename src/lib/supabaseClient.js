import { createClient } from '@supabase/supabase-js'

// Reads from Vite env. Copy .env.example to .env and fill these in to go live.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// When env vars are missing, we still export a client-shaped object so every
// call site can be written the same way. Calls will simply reject, and every
// data hook in this app already falls back to mock data in that case.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'public-anon-placeholder-key')

// ---------------------------------------------------------------------------
// Table names — centralised so a schema rename only touches one file.
// Assumes these tables already exist in the Supabase project:
//   profiles(id, full_name, role, avatar_url, phone)
//   students(id, nis, full_name, class_id, parent_id, status)
//   classes(id, name, homeroom_teacher, grade_level)
//   spp_rates(id, class_id, nominal, period_month, period_year)
//   invoices(id, student_id, spp_rate_id, amount, status, due_date, period_month, period_year)
//   payments(id, invoice_id, method, amount, status, paid_at, reference_code, receipt_sent)
// ---------------------------------------------------------------------------
export const TABLES = {
  profiles: 'profiles',
  students: 'students',
  classes: 'classes',
  sppRates: 'spp_rates',
  invoices: 'invoices',
  payments: 'payments',
}
