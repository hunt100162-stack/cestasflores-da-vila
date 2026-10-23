CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, coalesce(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), NEW.email);
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.place_order(jsonb,text,text,date,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb,text,text,date,text) TO authenticated;
ALTER POLICY "anyone reads product images" ON storage.objects
USING (bucket_id = 'product-images' AND (public.is_staff(auth.uid()) OR EXISTS (SELECT 1 FROM public.products p WHERE p.active AND storage.objects.name = ANY(p.images))));
ALTER POLICY "public reads product categories" ON public.product_categories
USING (public.is_staff(auth.uid()) OR (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.active) AND EXISTS (SELECT 1 FROM public.categories c WHERE c.id = category_id AND c.active)));