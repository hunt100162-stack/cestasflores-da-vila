<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Editable business data (WhatsApp number, address, hours, Instagram) lives in `src/config/site.ts`.
- Public product records, prices, stock and product/category links come from Supabase; category/occasion presentation assets and example image mappings live in `src/data/catalog.ts`.
- The current customer purchase flow prepares a WhatsApp message. Do not claim that `place_order` is used by the storefront unless the flow is explicitly integrated and tested.
- Admin/staff access is based on `user_roles` and `is_staff()` policies in RLS. New signups must never be promoted automatically; provision the store administrator explicitly through a trusted database operator.
- Example products use `is_example = true` and are hidden from the public catalog until the owner confirms them through the admin editor. Example images use `demo:<asset-name>` keys resolved to bundled assets.
