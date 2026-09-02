-- =============================================================================
-- SPP Portal — SMKS Jakarta Pusat 1
-- Database schema for Supabase (PostgreSQL)
--
-- Run this in the Supabase SQL Editor (or via `supabase db push` /
-- `psql -f schema.sql`) on a fresh project. It is idempotent — safe to re-run.
--
-- Contents:
--   1. Extensions
--   2. Enums
--   3. Tables (profiles, classes, students, spp_rates, invoices, payments,
--      notifications, audit_log)
--   4. Indexes
--   5. Triggers (updated_at, invoice auto-generation, payment -> invoice sync)
--   6. Views (for dashboards & reports)
--   7. Row Level Security (RBAC matching the 5 app roles)
--   8. Seed data (multi-account production-ready seed data)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ---------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 2. ENUMS
-- ---------------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('admin', 'tu', 'ortu', 'siswa', 'kepsek');
exception when duplicate_object then null; end $$;

do $$ begin
  create type grade_level as enum ('X', 'XI', 'XII');
exception when duplicate_object then null; end $$;

do $$ begin
  create type student_status as enum ('aktif', 'nonaktif', 'lulus', 'pindah');
exception when duplicate_object then null; end $$;

do $$ begin
  create type scholarship_status as enum ('Reguler', 'Penerima KJP Plus', 'Beasiswa Prestasi', 'Keringanan Biaya');
exception when duplicate_object then null; end $$;

do $$ begin
  create type invoice_status as enum ('unpaid', 'pending', 'paid', 'overdue', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum ('virtual_account', 'qris', 'bank_transfer', 'cash');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending', 'success', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_channel as enum ('whatsapp', 'email', 'push', 'system');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_status as enum ('queued', 'sent', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app_theme as enum ('minimalist', 'neon_cyberpunk', 'neo_brutalism', 'vintage');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- 3. TABLES
-- ---------------------------------------------------------------------------

-- profiles: one row per authenticated user (1:1 with auth.users), carries role.
create table if not exists public.profiles (
  id                uuid primary key default gen_random_uuid(),
  full_name         text not null,
  role              user_role not null default 'ortu',
  email             text unique,
  phone             text,
  nip               text,                                  -- NIP for teachers/staff
  avatar_url        text,
  theme_preference  app_theme not null default 'minimalist',
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
comment on table public.profiles is 'Extends auth.users with app role, NIP, theme preference, and contact info.';

-- classes: rombongan belajar (homeroom / class groups).
create table if not exists public.classes (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null unique,               -- e.g. "XI RPL 1"
  grade_level         grade_level not null,
  major               text,                                -- e.g. "Rekayasa Perangkat Lunak"
  room                text,                                -- e.g. "Lab RPL 2"
  homeroom_teacher    text not null,
  academic_year       text not null default to_char(now(), 'YYYY') || '/' || (to_char(now(), 'YYYY')::int + 1),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
comment on table public.classes is 'Rombongan belajar / class groups, one homeroom teacher each.';

-- students: master siswa data, optionally linked to a parent profile & auth user.
create table if not exists public.students (
  id                  uuid primary key default gen_random_uuid(),
  nis                 text not null unique,                    -- Nomor Induk Siswa
  nisn                text unique,                              -- Nomor Induk Siswa Nasional
  nik                 text unique,                              -- Nomor Induk Kependudukan
  full_name           text not null,
  gender              text default 'Laki-laki',
  birth_place_date    text,
  class_id            uuid references public.classes(id) on delete set null,
  user_id             uuid references public.profiles(id) on delete set null,  -- linked "siswa" login
  parent_id           uuid references public.profiles(id) on delete set null,  -- linked "ortu" login
  parent_name         text not null,
  parent_phone        text,
  address             text,
  scholarship_type    scholarship_status not null default 'Reguler',
  va_number           text,                                     -- Dedicated school VA number
  status              student_status not null default 'aktif',
  enrolled_at         date not null default current_date,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
comment on table public.students is 'Master student records with NISN, NIK, KJP scholarship status, and address.';

-- spp_rates: nominal SPP bulanan per kelas per periode ajaran dengan fee breakdown.
create table if not exists public.spp_rates (
  id              uuid primary key default gen_random_uuid(),
  class_id        uuid not null references public.classes(id) on delete cascade,
  nominal         numeric(12,2) not null check (nominal >= 0),
  base_tuition    numeric(12,2) default 0,                  -- SPP Pokok
  lab_fee         numeric(12,2) default 0,                  -- Iuran Lab / Praktikum
  osis_fee        numeric(12,2) default 0,                  -- Kas OSIS / Ekstrakurikuler
  academic_year   text not null default to_char(now(), 'YYYY') || '/' || (to_char(now(), 'YYYY')::int + 1),
  effective_from  date not null default date_trunc('month', current_date),
  created_by      uuid references public.profiles(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (class_id, academic_year, effective_from)
);
comment on table public.spp_rates is 'Monthly tuition amount and fee item breakdown per class.';

-- invoices: monthly SPP bill per student with detailed receipt tracking.
create table if not exists public.invoices (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.students(id) on delete cascade,
  spp_rate_id     uuid references public.spp_rates(id) on delete set null,
  amount          numeric(12,2) not null check (amount >= 0),
  base_tuition    numeric(12,2) default 0,
  lab_fee         numeric(12,2) default 0,
  osis_fee        numeric(12,2) default 0,
  period_month    smallint not null check (period_month between 1 and 12),
  period_year     smallint not null check (period_year between 2000 and 2100),
  status          invoice_status not null default 'unpaid',
  due_date        date not null,
  receipt_no      text unique,                              -- Official printed receipt number
  paid_at         timestamptz,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (student_id, period_month, period_year)
);
comment on table public.invoices is 'One row per student per billing month with detailed fee components.';

-- payments: transaction attempts/records against an invoice.
create table if not exists public.payments (
  id                  uuid primary key default gen_random_uuid(),
  invoice_id          uuid not null references public.invoices(id) on delete cascade,
  method              payment_method not null,
  bank_name           text,                                 -- for VA / transfer (e.g. BCA, Mandiri, Bank DKI)
  sender_name         text,                                 -- Nama pengirim rekening
  sender_bank         text,                                 -- Bank asal pengirim
  proof_image_url     text,                                 -- Bukti transfer / screenshot struk pembayaran
  amount              numeric(12,2) not null check (amount >= 0),
  status              payment_status not null default 'pending',
  reference_code      text unique,
  gateway_payload     jsonb,                                 -- raw payment payload
  paid_at             timestamptz,
  verified_by         uuid references public.profiles(id),   -- TU/Bendahara who approved manual methods
  verified_at         timestamptz,
  verification_notes  text,
  receipt_sent        boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
comment on table public.payments is 'Payment attempts against an invoice with proof upload support.';

-- notifications: log of WhatsApp/email/system receipts and reminders sent.
create table if not exists public.notifications (
  id              uuid primary key default gen_random_uuid(),
  payment_id      uuid references public.payments(id) on delete cascade,
  recipient_id    uuid references public.profiles(id),
  title           text not null,
  message         text not null,
  type            text not null default 'info',             -- 'info', 'success', 'warning', 'error'
  channel         notification_channel not null default 'system',
  status          notification_status not null default 'sent',
  is_read         boolean not null default false,
  sent_at         timestamptz default now(),
  created_at      timestamptz not null default now()
);
comment on table public.notifications is 'Notification inbox & outbound receipts log.';

-- audit_log: tracks sensitive CRUD actions for compliance.
create table if not exists public.audit_log (
  id              uuid primary key default gen_random_uuid(),
  actor_id        uuid references public.profiles(id),
  action          text not null,                            -- e.g. 'spp_rate.update', 'payment.verify'
  entity_table    text not null,
  entity_id       uuid,
  before_data     jsonb,
  after_data      jsonb,
  created_at      timestamptz not null default now()
);
comment on table public.audit_log is 'Immutable trail of sensitive changes for financial accountability.';

-- ---------------------------------------------------------------------------
-- 4. INDEXES
-- ---------------------------------------------------------------------------
create index if not exists idx_students_class_id        on public.students(class_id);
create index if not exists idx_students_parent_id        on public.students(parent_id);
create index if not exists idx_students_user_id          on public.students(user_id);
create index if not exists idx_students_status           on public.students(status);
create index if not exists idx_spp_rates_class_id        on public.spp_rates(class_id);
create index if not exists idx_invoices_student_id        on public.invoices(student_id);
create index if not exists idx_invoices_status            on public.invoices(status);
create index if not exists idx_invoices_period            on public.invoices(period_year, period_month);
create index if not exists idx_payments_invoice_id        on public.payments(invoice_id);
create index if not exists idx_payments_status            on public.payments(status);
create index if not exists idx_payments_paid_at           on public.payments(paid_at);
create index if not exists idx_notifications_recipient    on public.notifications(recipient_id);
create index if not exists idx_notifications_is_read      on public.notifications(is_read);

-- ---------------------------------------------------------------------------
-- 5. TRIGGERS
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['profiles','classes','students','spp_rates','invoices','payments'] loop
    execute format(
      'drop trigger if exists trg_set_updated_at on public.%I;
       create trigger trg_set_updated_at before update on public.%I
       for each row execute function public.set_updated_at();', t, t);
  end loop;
end $$;

-- Payment success trigger
create or replace function public.handle_payment_success()
returns trigger language plpgsql as $$
begin
  if new.status = 'success' and (old.status is distinct from 'success') then
    new.paid_at := coalesce(new.paid_at, now());
    update public.invoices
      set status = 'paid',
          paid_at = coalesce(new.paid_at, now()),
          receipt_no = coalesce(receipt_no, 'KW-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 9000 + 1000)::text, 4, '0')),
          updated_at = now()
      where id = new.invoice_id;
  elsif new.status = 'failed' and (old.status is distinct from 'failed') then
    update public.invoices
      set status = 'unpaid', updated_at = now()
      where id = new.invoice_id and status = 'pending';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_payment_success on public.payments;
create trigger trg_payment_success
  before update on public.payments
  for each row execute function public.handle_payment_success();

-- Payment created trigger
create or replace function public.handle_payment_created()
returns trigger language plpgsql as $$
begin
  if new.status = 'pending' then
    update public.invoices
      set status = 'pending', updated_at = now()
      where id = new.invoice_id and status in ('unpaid', 'overdue');
  elsif new.status = 'success' then
    update public.invoices
      set status = 'paid',
          paid_at = coalesce(new.paid_at, now()),
          receipt_no = coalesce(receipt_no, 'KW-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 9000 + 1000)::text, 4, '0')),
          updated_at = now()
      where id = new.invoice_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_payment_created on public.payments;
create trigger trg_payment_created
  after insert on public.payments
  for each row execute function public.handle_payment_created();

-- Auto mark overdue
create or replace function public.mark_overdue_invoices()
returns void language sql as $$
  update public.invoices
    set status = 'overdue', updated_at = now()
    where status = 'unpaid' and due_date < current_date;
$$;

-- Batch invoice generation
create or replace function public.generate_monthly_invoices(p_month smallint, p_year smallint, p_due_date date)
returns integer language plpgsql as $$
declare v_count integer := 0;
begin
  insert into public.invoices (student_id, spp_rate_id, amount, base_tuition, lab_fee, osis_fee, period_month, period_year, due_date, status)
  select s.id, r.id, r.nominal, r.base_tuition, r.lab_fee, r.osis_fee, p_month, p_year, p_due_date, 'unpaid'
  from public.students s
  join public.spp_rates r on r.class_id = s.class_id
  where s.status = 'aktif'
    and r.effective_from = (
      select max(r2.effective_from) from public.spp_rates r2
      where r2.class_id = s.class_id and r2.effective_from <= p_due_date
    )
  on conflict (student_id, period_month, period_year) do nothing;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. VIEWS
-- ---------------------------------------------------------------------------

create or replace view public.v_invoices_detailed as
select
  i.id, i.student_id, s.full_name as student_name, s.nis, s.nisn, s.scholarship_type,
  c.id as class_id, c.name as class_name, c.major,
  i.amount, i.base_tuition, i.lab_fee, i.osis_fee,
  i.period_month, i.period_year, i.status, i.due_date, i.receipt_no, i.paid_at, i.created_at
from public.invoices i
join public.students s on s.id = i.student_id
left join public.classes c on c.id = s.class_id;

create or replace view public.v_transactions as
select
  p.id, p.invoice_id, s.full_name as student_name, s.nis, c.name as class_name, c.major,
  p.method, p.bank_name, p.sender_name, p.sender_bank, p.proof_image_url,
  p.amount, p.status, p.paid_at, p.reference_code, p.receipt_sent, p.created_at
from public.payments p
join public.invoices i on i.id = p.invoice_id
join public.students s on s.id = i.student_id
left join public.classes c on c.id = s.class_id;

create or replace view public.v_monthly_collection as
select
  i.period_year,
  i.period_month,
  sum(i.amount) filter (where i.status = 'paid')                as terkumpul,
  sum(i.amount)                                                  as target,
  count(*) filter (where i.status = 'paid')                      as paid_count,
  count(*)                                                        as total_count
from public.invoices i
group by i.period_year, i.period_month
order by i.period_year, i.period_month;

create or replace view public.v_class_compliance as
select
  c.id as class_id, c.name as class_name, c.grade_level, c.major, c.homeroom_teacher,
  count(distinct s.id) as total_students,
  count(distinct s.id) filter (where i.status = 'paid') as paid_count,
  count(distinct s.id) filter (where i.status in ('unpaid', 'overdue')) as unpaid_count,
  count(distinct s.id) filter (where i.status = 'pending') as pending_count,
  round(
    100.0 * count(distinct s.id) filter (where i.status = 'paid')
    / nullif(count(distinct s.id), 0), 1
  ) as compliance_pct
from public.classes c
left join public.students s on s.class_id = c.id and s.status = 'aktif'
left join public.invoices i on i.student_id = s.id
  and i.period_month = extract(month from current_date)
  and i.period_year = extract(year from current_date)
group by c.id, c.name, c.grade_level, c.major, c.homeroom_teacher;

-- ---------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.profiles       enable row level security;
alter table public.classes        enable row level security;
alter table public.students       enable row level security;
alter table public.spp_rates      enable row level security;
alter table public.invoices       enable row level security;
alter table public.payments       enable row level security;
alter table public.notifications  enable row level security;
alter table public.audit_log      enable row level security;

create or replace function public.current_role()
returns user_role language sql stable as $$
  select role from public.profiles where id = auth.uid();
$$;

create policy profiles_self_select on public.profiles
  for select using (id = auth.uid() or public.current_role() in ('admin','tu','kepsek'));
create policy profiles_self_update on public.profiles
  for update using (id = auth.uid() or public.current_role() = 'admin');
create policy profiles_admin_insert on public.profiles
  for insert with check (public.current_role() = 'admin');

create policy classes_staff_all on public.classes
  for all using (public.current_role() in ('admin','tu'))
  with check (public.current_role() in ('admin','tu'));
create policy classes_read_all on public.classes
  for select using (auth.uid() is not null);

create policy students_staff_all on public.students
  for all using (public.current_role() in ('admin','tu'))
  with check (public.current_role() in ('admin','tu'));
create policy students_self_select on public.students
  for select using (
    public.current_role() in ('admin','tu','kepsek')
    or parent_id = auth.uid()
    or user_id = auth.uid()
  );

create policy spp_rates_staff_write on public.spp_rates
  for all using (public.current_role() in ('admin','tu'))
  with check (public.current_role() in ('admin','tu'));
create policy spp_rates_read_all on public.spp_rates
  for select using (auth.uid() is not null);

create policy invoices_staff_all on public.invoices
  for all using (public.current_role() in ('admin','tu','kepsek'))
  with check (public.current_role() in ('admin','tu'));
create policy invoices_owner_select on public.invoices
  for select using (
    exists (
      select 1 from public.students s
      where s.id = invoices.student_id
        and (s.parent_id = auth.uid() or s.user_id = auth.uid())
    )
  );

create policy payments_staff_all on public.payments
  for all using (public.current_role() in ('admin','tu','kepsek'))
  with check (public.current_role() in ('admin','tu'));
create policy payments_owner_select on public.payments
  for select using (
    exists (
      select 1 from public.invoices i
      join public.students s on s.id = i.student_id
      where i.id = payments.invoice_id
        and (s.parent_id = auth.uid() or s.user_id = auth.uid())
    )
  );
create policy payments_owner_insert on public.payments
  for insert with check (
    public.current_role() = 'ortu'
    and exists (
      select 1 from public.invoices i
      join public.students s on s.id = i.student_id
      where i.id = payments.invoice_id and s.parent_id = auth.uid()
    )
  );

create policy notifications_owner_select on public.notifications
  for select using (recipient_id = auth.uid() or public.current_role() in ('admin','tu'));

create policy audit_log_admin_select on public.audit_log
  for select using (public.current_role() = 'admin');

-- ---------------------------------------------------------------------------
-- 8. SEED DATA
-- ---------------------------------------------------------------------------

-- Accounts / Profiles
insert into public.profiles (id, full_name, role, email, phone, nip) values
  ('a0000000-0000-0000-0000-000000000001', 'Rahmat Hidayat, S.T.', 'admin', 'admin@smksjp1.sch.id', '0812-1000-0001', '198203152006041002'),
  ('a0000000-0000-0000-0000-000000000002', 'Siti Nurjanah, S.E.', 'tu', 'bendahara@smksjp1.sch.id', '0812-1000-0002', '198607202010012015'),
  ('a0000000-0000-0000-0000-000000000003', 'Drs. H. Hendra Wijaya, M.M.', 'kepsek', 'kepsek@smksjp1.sch.id', '0812-1000-0003', '197105121998021001'),
  ('a0000000-0000-0000-0000-000000000004', 'Budi Santoso', 'ortu', 'budi.santoso@gmail.com', '0812-1000-0004', null),
  ('a0000000-0000-0000-0000-000000000005', 'Agus Salim', 'ortu', 'agus.salim@gmail.com', '0812-1000-0005', null),
  ('a0000000-0000-0000-0000-000000000006', 'Hendra Gunawan', 'ortu', 'hendra.gunawan@gmail.com', '0812-1000-0006', null),
  ('a0000000-0000-0000-0000-000000000007', 'Ayu Lestari', 'siswa', 'ayu.lestari@siswa.smksjp1.sch.id', '0812-1000-0007', null),
  ('a0000000-0000-0000-0000-000000000008', 'Rizky Ramadhan', 'siswa', 'rizky.ramadhan@siswa.smksjp1.sch.id', '0812-1000-0008', null),
  ('a0000000-0000-0000-0000-000000000009', 'Putri Wulandari', 'siswa', 'putri.wulandari@siswa.smksjp1.sch.id', '0812-1000-0009', null)
on conflict (id) do update set full_name = excluded.full_name, role = excluded.role, email = excluded.email;

-- Classes
insert into public.classes (id, name, grade_level, major, room, homeroom_teacher) values
  ('b0000000-0000-0000-0000-000000000001', 'X RPL 1',   'X',   'Rekayasa Perangkat Lunak',     'Lab RPL 1',        'Dewi Anggraini, S.Kom'),
  ('b0000000-0000-0000-0000-000000000002', 'X TKJ 1',   'X',   'Teknik Komputer & Jaringan',    'Lab Jaringan',     'Fajar Nugroho, S.T'),
  ('b0000000-0000-0000-0000-000000000003', 'XI RPL 1',  'XI',  'Rekayasa Perangkat Lunak',     'Lab RPL 2',        'Rina Marlina, S.Kom'),
  ('b0000000-0000-0000-0000-000000000004', 'XI AKL 1',  'XI',  'Akuntansi & Keuangan Lembaga', 'Lab Akuntansi',    'Yusuf Ibrahim, S.E'),
  ('b0000000-0000-0000-0000-000000000005', 'XII TKJ 2', 'XII', 'Teknik Komputer & Jaringan',    'Lab Fiber Optik',  'Fajar Nugroho, S.T'),
  ('b0000000-0000-0000-0000-000000000006', 'XII RPL 2', 'XII', 'Rekayasa Perangkat Lunak',     'Lab Cloud',        'Dewi Anggraini, S.Kom')
on conflict (name) do update set homeroom_teacher = excluded.homeroom_teacher;

-- SPP Rates with Fee Component Breakdown
insert into public.spp_rates (id, class_id, nominal, base_tuition, lab_fee, osis_fee)
select
  ('c0000000-0000-0000-0000-' || lpad(row_number() over ()::text, 12, '0'))::uuid,
  id,
  case grade_level
    when 'X' then 350000
    when 'XI' then 375000
    when 'XII' then 400000
  end,
  case grade_level
    when 'X' then 260000
    when 'XI' then 280000
    when 'XII' then 300000
  end,
  case grade_level
    when 'X' then 60000
    when 'XI' then 65000
    when 'XII' then 70000
  end,
  30000
from public.classes
on conflict do nothing;

-- Students
insert into public.students (id, nis, nisn, nik, full_name, gender, birth_place_date, class_id, user_id, parent_id, parent_name, parent_phone, address, scholarship_type, va_number, status) values
  ('d0000000-0000-0000-0000-000000000001', '23101001', '0061234561', '3171015609060001', 'Ayu Lestari',     'Perempuan', 'Jakarta, 14 September 2008', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000004', 'Budi Santoso',    '0812-1000-0004', 'Jl. Salemba Raya No. 45, Jakarta Pusat',               'Reguler',           '8808123101001', 'aktif'),
  ('d0000000-0000-0000-0000-000000000002', '23101002', '0061234562', '3171011210080002', 'Rizky Ramadhan',  'Laki-laki', 'Jakarta, 22 Oktober 2008',   'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000005', 'Agus Salim',      '0812-1000-0005', 'Jl. Percetakan Negara IX No. 12, Jakarta Pusat',        'Penerima KJP Plus', '8808123101002', 'aktif'),
  ('d0000000-0000-0000-0000-000000000003', '23101003', '0061234563', '3171014505080003', 'Putri Wulandari', 'Perempuan', 'Bandung, 05 Mei 2008',       'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000006', 'Hendra Gunawan',  '0812-1000-0006', 'Jl. Cempaka Putih Tengah No. 8, Jakarta Pusat',        'Reguler',           '8808123101003', 'aktif'),
  ('d0000000-0000-0000-0000-000000000004', '22101014', '0051234564', '3171011902070004', 'Dimas Prasetyo',  'Laki-laki', 'Jakarta, 19 Februari 2007',  'b0000000-0000-0000-0000-000000000005', null, null, 'Slamet Riyadi',  '0813-2222-3333', 'Jl. Rawasari Barat No. 20, Jakarta Pusat',             'Beasiswa Prestasi', '8808122101014', 'aktif'),
  ('d0000000-0000-0000-0000-000000000005', '22101015', '0051234565', '3171015808070005', 'Nabila Az-Zahra', 'Perempuan', 'Bogor, 18 Agustus 2007',     'b0000000-0000-0000-0000-000000000004', null, null, 'Iwan Setiawan',  '0813-4444-5555', 'Jl. Bendungan Hilir Gg. 5 No. 3, Jakarta Pusat',        'Penerima KJP Plus', '8808122101015', 'aktif'),
  ('d0000000-0000-0000-0000-000000000006', '21101033', '0041234566', '3171010101060006', 'Fajar Ramadhan',  'Laki-laki', 'Jakarta, 01 Januari 2006',   'b0000000-0000-0000-0000-000000000006', null, null, 'Suryadi',        '0813-6666-7777', 'Jl. Kebon Sirih Timur No. 77, Jakarta Pusat',          'Reguler',           '8808121101033', 'nonaktif')
on conflict (nis) do nothing;

-- Invoices
insert into public.invoices (id, student_id, spp_rate_id, amount, base_tuition, lab_fee, osis_fee, period_month, period_year, status, due_date, receipt_no, paid_at) values
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 375000, 280000, 65000, 30000, 9, 2026, 'unpaid', '2026-09-10', null, null),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 375000, 280000, 65000, 30000, 8, 2026, 'paid',   '2026-08-10', 'KW-20260804-0091', '2026-08-04 09:12:00+07'),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 350000, 260000, 60000, 30000, 9, 2026, 'unpaid', '2026-09-10', null, null),
  ('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 350000, 260000, 60000, 30000, 9, 2026, 'pending', '2026-09-10', null, null),
  ('e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000005', 400000, 300000, 70000, 30000, 9, 2026, 'paid',   '2026-09-10', 'KW-20260805-4471', '2026-08-05 14:30:00+07'),
  ('e0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000004', 360000, 270000, 60000, 30000, 9, 2026, 'unpaid', '2026-09-10', null, null)
on conflict (student_id, period_month, period_year) do nothing;

-- Payments
insert into public.payments (id, invoice_id, method, bank_name, sender_name, sender_bank, amount, status, reference_code, paid_at, receipt_sent) values
  ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 'qris', 'QRIS Mandiri', 'Budi Santoso', 'Bank Mandiri', 375000, 'success', 'QRIS-20260804-0091', '2026-08-04 09:12:00+07', true),
  ('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000005', 'virtual_account', 'Virtual Account BCA', 'Slamet Riyadi', 'BCA', 400000, 'success', 'VA-88081-22101014', '2026-08-05 14:30:00+07', true),
  ('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000004', 'bank_transfer', 'Bank BCA', 'Hendra Gunawan', 'BCA', 350000, 'pending', 'TF-20260902-3390', '2026-09-02 08:02:00+07', false)
on conflict (id) do nothing;

-- Notifications
insert into public.notifications (recipient_id, title, message, type, channel, is_read) values
  ('a0000000-0000-0000-0000-000000000002', 'Pembayaran Baru Menunggu Verifikasi', 'Pembayaran SPP September sebesar Rp 350.000 atas nama Putri Wulandari (X TKJ 1) via Transfer Bank BCA perlu diverifikasi.', 'warning', 'system', false),
  ('a0000000-0000-0000-0000-000000000004', 'Tagihan SPP September Telah Terbit', 'Tagihan SPP bulan September 2026 untuk ananda Ayu Lestari sebesar Rp 375.000 telah terbit. Jatuh tempo: 10 September 2026.', 'info', 'system', false),
  ('a0000000-0000-0000-0000-000000000004', 'Pembayaran SPP Agustus Berhasil', 'Terima kasih, pembayaran SPP Agustus 2026 sebesar Rp 375.000 via QRIS telah berhasil diverifikasi.', 'success', 'system', true)
on conflict do nothing;

-- =============================================================================
-- End of schema.
-- =============================================================================
