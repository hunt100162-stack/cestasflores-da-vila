create type public.app_role as enum ('admin','staff');
create type public.order_status as enum ('pendente','aguardando_pagamento','pago','em_preparo','enviado','entregue','cancelado');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','staff'))
$$;

create policy "own roles or admin" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admin manages roles" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
grant insert, update, delete on public.user_roles to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.is_staff(auth.uid()));
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());

-- First account ever becomes admin (the owner); later accounts are customers.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), new.email);
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "public reads active categories" on public.categories for select to anon, authenticated using (active or public.is_staff(auth.uid()));
create policy "staff manage categories" on public.categories for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  promo_price numeric(10,2) check (promo_price is null or promo_price >= 0),
  price_from boolean not null default false,
  images text[] not null default '{}',
  stock int not null default 0 check (stock >= 0),
  low_stock_threshold int not null default 3,
  track_expiry boolean not null default false,
  active boolean not null default true,
  is_example boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "public reads active products" on public.products for select to anon, authenticated using (active or public.is_staff(auth.uid()));
create policy "staff manage products" on public.products for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create table public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (product_id, category_id)
);
grant select on public.product_categories to anon, authenticated;
grant insert, update, delete on public.product_categories to authenticated;
grant all on public.product_categories to service_role;
alter table public.product_categories enable row level security;
create policy "public reads product categories" on public.product_categories for select to anon, authenticated using (true);
create policy "staff manage product categories" on public.product_categories for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create table public.product_lots (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  lot_code text not null,
  quantity int not null default 0 check (quantity >= 0),
  expires_at date,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.product_lots to authenticated;
grant all on public.product_lots to service_role;
alter table public.product_lots enable row level security;
create policy "staff manage lots" on public.product_lots for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  status order_status not null default 'pendente',
  total numeric(10,2) not null,
  customer_name text,
  phone text,
  delivery_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "own or staff read orders" on public.orders for select to authenticated using (user_id = auth.uid() or public.is_staff(auth.uid()));
create policy "staff update orders" on public.orders for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(10,2) not null,
  quantity int not null check (quantity > 0)
);
grant select on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "read items of visible orders" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff(auth.uid()))));

-- Places an order: prices and stock are read from the database, never trusted from the browser.
create or replace function public.place_order(_items jsonb, _customer_name text, _phone text, _delivery_date date, _notes text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  _uid uuid := auth.uid();
  _order uuid;
  _it jsonb;
  _p public.products%rowtype;
  _qty int;
  _price numeric;
  _total numeric := 0;
begin
  if _uid is null then raise exception 'É preciso entrar na sua conta para fazer pedidos.'; end if;
  if jsonb_typeof(_items) <> 'array' or jsonb_array_length(_items) = 0 then raise exception 'Carrinho vazio.'; end if;
  insert into public.orders (user_id, total, customer_name, phone, delivery_date, notes)
    values (_uid, 0, left(_customer_name,120), left(_phone,40), _delivery_date, left(_notes,1000)) returning id into _order;
  for _it in select * from jsonb_array_elements(_items) loop
    _qty := (_it->>'quantity')::int;
    if _qty is null or _qty <= 0 or _qty > 100 then raise exception 'Quantidade inválida.'; end if;
    select * into _p from public.products where id = (_it->>'product_id')::uuid and active for update;
    if not found then raise exception 'Produto indisponível.'; end if;
    if _p.stock < _qty then raise exception 'Estoque insuficiente para %: restam %.', _p.name, _p.stock; end if;
    _price := coalesce(_p.promo_price, _p.price);
    update public.products set stock = stock - _qty, updated_at = now() where id = _p.id;
    insert into public.order_items (order_id, product_id, product_name, unit_price, quantity) values (_order, _p.id, _p.name, _price, _qty);
    _total := _total + _price * _qty;
  end loop;
  update public.orders set total = _total where id = _order;
  return _order;
end $$;
revoke all on function public.place_order(jsonb,text,text,date,text) from public, anon;
grant execute on function public.place_order(jsonb,text,text,date,text) to authenticated;

-- Seed existing storefront as clearly-marked examples. Images use "demo:" keys resolved by the app.
insert into public.categories (name, slug, sort_order, image_url) values
 ('Rosas','rosas',1,'demo:p-rosas'),('Tulipas','tulipas',2,'demo:p-tulipas'),('Girassóis','girassois',3,'demo:p-girassois'),
 ('Orquídeas','orquideas',4,'demo:p-orquidea'),('Buquês especiais','buques',5,'demo:p-romantico'),('Plantas e vasos','plantas',6,'demo:p-vaso'),
 ('Cestas e presentes','cestas',7,'demo:p-cesta'),('Casamentos e eventos','eventos',8,'demo:p-casamento');

insert into public.products (slug,name,description,price,price_from,images,stock,is_example,sort_order) values
 ('classico-rosas','Buquê Clássico de Rosas','Rosas vermelhas com eucalipto em papel kraft.',129.9,false,'{demo:p-rosas}',10,true,1),
 ('girassois','Buquê de Girassóis','Girassóis vibrantes para alegrar o dia.',99.9,false,'{demo:p-girassois}',10,true,2),
 ('romantico','Buquê Romântico','Rosas rosa e brancas com mosquitinho.',149.9,false,'{demo:p-romantico}',10,true,3),
 ('orquidea','Orquídea Elegante','Phalaenopsis branca em cachepô de cerâmica.',119.9,false,'{demo:p-orquidea}',10,true,4),
 ('primavera','Arranjo Primavera','Ranúnculos e margaridas em vaso de vidro.',139.9,false,'{demo:p-primavera}',10,true,5),
 ('tulipas','Buquê de Tulipas','Tulipas rosa e brancas em papel sálvia.',159.9,false,'{demo:p-tulipas}',10,true,6),
 ('caixa-rosas','Caixa de Rosas Premium','Rosas vermelhas em caixa redonda elegante.',189.9,false,'{demo:p-caixa}',10,true,7),
 ('cesta','Cesta Floral Especial','Flores, chocolates e mimos em cesta de vime.',169.9,false,'{demo:p-cesta}',10,true,8),
 ('delicado','Buquê Delicado','Lisianthus e flores em tons pastel.',89.9,false,'{demo:p-delicado}',10,true,9),
 ('aniversario','Arranjo para Aniversário','Gérberas e rosas coloridas em caixa festiva.',119.9,false,'{demo:p-aniversario}',10,true,10),
 ('vaso','Vaso Decorativo com Flores','Hortênsias em vaso de porcelana decorada.',109.9,false,'{demo:p-vaso}',10,true,11),
 ('personalizado','Buquê Personalizado','Você escolhe flores, cores e embalagem.',149.9,true,'{demo:p-casamento}',10,true,12);

insert into public.product_categories (product_id, category_id)
select p.id, c.id from public.products p join public.categories c on c.slug = case p.slug
  when 'classico-rosas' then 'rosas' when 'caixa-rosas' then 'rosas' when 'girassois' then 'girassois'
  when 'romantico' then 'buques' when 'delicado' then 'buques' when 'orquidea' then 'orquideas'
  when 'primavera' then 'plantas' when 'vaso' then 'plantas' when 'tulipas' then 'tulipas'
  when 'cesta' then 'cestas' when 'aniversario' then 'cestas' when 'personalizado' then 'eventos' end;
