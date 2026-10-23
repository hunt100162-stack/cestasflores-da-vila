REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.place_order(jsonb, text, text, date, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb, text, text, date, text) TO authenticated;