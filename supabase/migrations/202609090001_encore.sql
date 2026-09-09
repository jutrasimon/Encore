create table public.encore_rooms (
  code text primary key check (code ~ '^[A-F0-9]{12}$'),
  version bigint not null default 0,
  game jsonb not null,
  members jsonb not null,
  expires_at timestamptz not null
);
create index encore_rooms_expiry on public.encore_rooms(expires_at);
alter table public.encore_rooms enable row level security;
revoke all on public.encore_rooms from public, anon, authenticated;
grant select, insert, update, delete on public.encore_rooms to service_role;

-- Serialize room creation, bound storage, and make creation retries idempotent.
create function public.encore_create_room(room_data jsonb, creator_hash text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare existing public.encore_rooms;
begin
  perform pg_advisory_xact_lock(814593028);
  delete from public.encore_rooms where expires_at <= now();
  select * into existing from public.encore_rooms
    where members ? creator_hash order by expires_at desc limit 1;
  if found then return to_jsonb(existing); end if;
  if (select count(*) from public.encore_rooms)>=100 then
    raise exception 'Room capacity reached';
  end if;
  insert into public.encore_rooms(code,version,game,members,expires_at)
    values(room_data->>'code',0,room_data->'game',room_data->'members',(room_data->>'expires_at')::timestamptz)
    returning * into existing;
  return to_jsonb(existing);
end;
$$;
revoke all on function public.encore_create_room(jsonb,text) from public, anon, authenticated;
grant execute on function public.encore_create_room(jsonb,text) to service_role;
