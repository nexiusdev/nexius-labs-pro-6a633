alter table if exists nexius_os.shortlist_sessions
  add column if not exists user_id text;

alter table if exists nexius_os.interview_sessions
  add column if not exists user_id text;

create index if not exists idx_shortlist_sessions_user on nexius_os.shortlist_sessions(user_id);
create index if not exists idx_interview_sessions_user on nexius_os.interview_sessions(user_id);
