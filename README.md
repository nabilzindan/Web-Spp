# SPP Portal — SMKS Jakarta Pusat 1

A production-ready frontend + Supabase-backed logic layer for managing SPP (monthly
tuition) payments across five roles: Admin, Tata Usaha/Bendahara, Orang Tua/Wali,
Siswa, and Kepala Sekolah.

## Stack
- React 18 + Vite
- Tailwind CSS
- Lucide React icons
- Recharts
- @supabase/supabase-js

## Getting started
```bash
npm install
cp .env.example .env   # optional — app runs on mock data without this
npm run dev
```

## Connecting Supabase
Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`, then run the
full schema in **`supabase/schema.sql`** against your project (Supabase SQL Editor,
or `psql -f supabase/schema.sql`, or `supabase db push`). It is idempotent — safe
to re-run.

Until it's connected, every screen runs on realistic mock data defined in
`src/lib/mockData.js`, so the whole app is demo-able out of the box.

### Database schema (`supabase/schema.sql`)

**Enums** — `user_role`, `grade_level`, `student_status`, `invoice_status`,
`payment_method`, `payment_status`, `notification_channel`, `notification_status`.

**Tables**

| Table | Purpose | Key columns |
|---|---|---|
| `profiles` | 1:1 with `auth.users`; carries app role | `role`, `email`, `phone`, `is_active` |
| `classes` | Rombongan belajar | `name`, `grade_level`, `major`, `homeroom_teacher`, `academic_year` |
| `students` | Master student data | `nis`, `nisn`, `class_id`, `parent_id`, `user_id`, `status` |
| `spp_rates` | Monthly tuition per class, versioned by `effective_from` | `class_id`, `nominal`, `academic_year` |
| `invoices` | One bill per student per billing month | `student_id`, `amount`, `period_month/year`, `status`, `due_date` |
| `payments` | Transaction attempts against an invoice | `invoice_id`, `method`, `status`, `reference_code`, `gateway_payload` |
| `notifications` | WhatsApp/email/push receipt log (FR-008) | `payment_id`, `channel`, `status` |
| `audit_log` | Immutable trail of sensitive changes | `actor_id`, `action`, `before_data`, `after_data` |

**Relationships (ERD, text form)**
```
auth.users 1─1 profiles
profiles  1─* students        (parent_id → profiles.id)
profiles  1─1 students        (user_id   → profiles.id, siswa login)
classes   1─* students
classes   1─* spp_rates
students  1─* invoices
spp_rates 1─* invoices
invoices  1─* payments
payments  1─* notifications
```

**Triggers & functions**
- `set_updated_at()` — keeps `updated_at` fresh on every table.
- `handle_payment_created()` — new payment ⇒ invoice flips to `pending`.
- `handle_payment_success()` — payment ⇒ `success` marks the invoice `paid` and stamps `paid_at`; ⇒ `failed` reverts a `pending` invoice back to `unpaid`.
- `mark_overdue_invoices()` — sweeps `unpaid` invoices past `due_date` into `overdue` (schedule via `pg_cron` or an Edge Function).
- `generate_monthly_invoices(month, year, due_date)` — batch-creates the next billing cycle's invoices for all active students from each class's current `spp_rates` row.

**Views** (used directly by the app's dashboards & reports)
- `v_invoices_detailed` — invoices joined with student/class names.
- `v_transactions` — payments joined with student/class, feeds Financial Reports (FR-009).
- `v_monthly_collection` — `terkumpul` vs `target` per month, feeds the Recharts trend chart.
- `v_class_compliance` — % of active students paid this month, per class — feeds the Kepala Sekolah dashboard.

**Row Level Security** — enabled on every table, matching the app's 5 roles:
- `admin` / `tu`: full read/write on classes, students, spp_rates, invoices, payments.
- `kepsek`: read-only across students/invoices/payments (for analytics).
- `ortu`: can read and insert payments only for invoices belonging to their own linked student(s); read-only on their own student record.
- `siswa`: read-only on their own linked student record and its invoices.
- Every role can only read its own `profiles` row, except staff who can read all.

**Bootstrapping**: create your first `admin` by signing them up in Supabase Auth,
then manually inserting their `profiles` row with `role = 'admin'` (via the
Dashboard or service-role key) — after that, the admin can create further staff
profiles from within the app.

## Demo login
On the login screen, use any of the five "Mode Demo" role cards to sign in instantly
without a real Supabase session — useful for testing RBAC and each role's dashboard.

## Structure
```
src/
  lib/              Supabase client, table hook, mock data
  context/          AuthContext (role-based session)
  components/
    auth/           LoginPage
    layout/         Sidebar, Topbar, DashboardLayout
    dashboard/      Per-role dashboards + charts
    students/        Data Siswa CRUD
    classes/        Data Kelas CRUD
    spp/            Nominal SPP CRUD
    payment/        Parent payment portal (VA/QRIS/Transfer mock checkout)
    reports/        Filterable financial reports + export simulation
    common/         Badge, Modal, DataTable, StatCard
```
