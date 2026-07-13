-- Run this in the Supabase SQL editor for your project

-- Tutors (extends Supabase auth.users)
create table tutors (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  created_at timestamptz default now()
);

-- Parents (extends Supabase auth.users)
create table parents (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  created_at timestamptz default now()
);

-- Students belong to one tutor and one parent
create table students (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references tutors(id) on delete cascade,
  parent_id uuid not null references parents(id) on delete cascade,
  full_name text not null,
  grade text,
  created_at timestamptz default now()
);

-- Recurring weekly classes
create table classes (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references tutors(id) on delete cascade,
  subject text not null,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz default now()
);

-- Which students are in which recurring class
create table class_students (
  class_id uuid not null references classes(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  primary key (class_id, student_id)
);

-- One-off ad-hoc classes
create table adhoc_classes (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references tutors(id) on delete cascade,
  subject text not null,
  class_date date not null,
  start_time time not null,
  end_time time not null,
  created_at timestamptz default now()
);

-- Homework posts, tied to a class and a due date
create table homework (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references tutors(id) on delete cascade,
  class_id uuid references classes(id) on delete set null,
  title text not null,
  details text,
  due_date date not null,
  created_at timestamptz default now()
);

-- Messages/announcements from tutor to parents
create table messages (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references tutors(id) on delete cascade,
  student_id uuid references students(id) on delete cascade, -- null = broadcast to all
  body text not null,
  created_at timestamptz default now()
);

-- Attendance: one row per student per class session date
create table attendance (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references tutors(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  class_id uuid references classes(id) on delete set null,
  session_date date not null,
  status text not null check (status in ('present', 'absent')),
  created_at timestamptz default now(),
  unique (student_id, class_id, session_date)
);

-- Push tokens so we know where to send notifications
create table push_tokens (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references parents(id) on delete cascade,
  expo_push_token text not null,
  created_at timestamptz default now()
);

-- ---------- Row Level Security ----------
alter table tutors enable row level security;
alter table parents enable row level security;
alter table students enable row level security;
alter table classes enable row level security;
alter table class_students enable row level security;
alter table adhoc_classes enable row level security;
alter table homework enable row level security;
alter table messages enable row level security;
alter table attendance enable row level security;
alter table push_tokens enable row level security;

-- Tutors can only see/edit their own rows
create policy "tutors manage own students" on students
  for all using (tutor_id = auth.uid());

create policy "tutors manage own classes" on classes
  for all using (tutor_id = auth.uid());

create policy "tutors manage own adhoc classes" on adhoc_classes
  for all using (tutor_id = auth.uid());

create policy "tutors manage own homework" on homework
  for all using (tutor_id = auth.uid());

create policy "tutors manage own messages" on messages
  for all using (tutor_id = auth.uid());

create policy "tutors manage own attendance" on attendance
  for all using (tutor_id = auth.uid());

-- Parents can only see rows for their own children
create policy "parents view own children" on students
  for select using (parent_id = auth.uid());

create policy "parents view own children homework" on homework
  for select using (
    class_id in (
      select cs.class_id from class_students cs
      join students s on s.id = cs.student_id
      where s.parent_id = auth.uid()
    )
  );

create policy "parents view own children attendance" on attendance
  for select using (
    student_id in (select id from students where parent_id = auth.uid())
  );

create policy "parents view own children messages" on messages
  for select using (
    student_id in (select id from students where parent_id = auth.uid())
    or student_id is null
  );

create policy "parents manage own push token" on push_tokens
  for all using (parent_id = auth.uid());
