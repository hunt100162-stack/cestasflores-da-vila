-- Security hardening: signing up must never grant administrative privileges.
-- Existing user_roles are preserved. Provision the store owner explicitly after signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.email
  )
  on conflict (id) do nothing;

  return new;
end $$;

comment on function public.handle_new_user() is
  'Creates a profile for new accounts; admin/staff roles must be assigned explicitly by an existing admin or trusted database operator.';
