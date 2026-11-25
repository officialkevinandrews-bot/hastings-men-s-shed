<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- Site pages live as separate routes under src/routes with shared Header/Footer in __root; why: crawlable, shareable pages.
- Shed photos are CDN asset pointers in src/assets/shed, captions/categories mapped in src/lib/gallery.ts; why: one place to edit the showcase.
- Enquiries are inserted server-side via createServerFn; only the service role and active allowlisted admins may read submissions, with admin updates/deletes enforced by RLS; why: visitor submissions remain private.
- Admin permissions live in the protected admin_users allowlist, never in profiles or editable auth metadata; JWT email and active/owner status are checked by database helpers; why: only owners can change the allowlist.
- CMS tables expose public reads and restrict writes to active allowlisted admins; shed-media follows the same read/write boundary; why: public content stays accessible without exposing editing permissions.
