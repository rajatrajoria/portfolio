# Rajat Rajoria — Portfolio + CMS

A dark, fully responsive portfolio with a built-in admin panel at **`/admin`**.
Everything on the site (profile, photo, home sections, experience, projects, blog, new pages) is edited from the admin, with no code changes.

- **Public site:** home page made of reorderable sections, detail pages for every experience (photos and certificates) and project, and any number of extra pages built from templates.
- **Admin CMS:** edit everything, then hit **Save** (or `Ctrl/⌘ + S`). Upload images and PDFs by drag and drop. Blog posts and other entries have their own Draft/Publish buttons.
- **Always current:** "Years of experience" and role durations are worked out from your dates against today's date.

Stack: React 18, Vite, TypeScript, Tailwind, and Supabase (Postgres, Auth, Storage, all on the free tier). Hosted on Netlify.

---

## Run locally

```bash
npm install
npm run dev          # http://localhost:5173  ·  admin at /admin
```

Without Supabase keys the app runs in **local mode**. The admin works fully, but changes are stored only in your browser's localStorage. It's useful for trying things out. To make edits live for everyone, connect Supabase.

---

## Go live (one-time setup, about 10 minutes)

### 1. Create a Supabase project
1. Sign up at <https://supabase.com> → **New project** (free tier is fine). Choose a region near you, such as Mumbai.
2. Open **SQL Editor** → **New query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and click **Run**.
   This creates the tables, the security rules, and a public `media` bucket for uploads.

### 2. Create your admin login
1. **Authentication → Users → Add user → Create new user**. Enter your email and a strong password, and tick *Auto confirm*.
2. **Authentication → Sign In / Providers → Email**: turn **off** "Allow new users to sign up". Only you should have an account.

### 3. Mark yourself as the admin
In **SQL Editor** run (with your email):

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'you@example.com';
```

Only users in `admins` can write content or upload files. Everyone else can only read published content.

### 4. Add the keys
**Project Settings → API**: copy the *Project URL* and the *anon public* key.

- Locally: copy `.env.example` to `.env.local` and fill them in.
- On Netlify: **Site configuration → Environment variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

The anon key is designed to be public. Row Level Security in `schema.sql` is what protects your data.

### 5. Deploy on Netlify
Push this folder to a GitHub repo, then on Netlify choose **Add new site → Import from Git** and pick it.
Build settings come from `netlify.toml` (`npm run build` → `dist`). To keep your current URL, connect the repo to your existing `rajat-rajoria` site instead of creating a new one.

### 6. Publish your content
Open `https://<your-site>/admin`, sign in, and click **Publish starter content** on the dashboard.
From then on, every edit + **Save** is live immediately. No redeploy needed.

---

## Using the CMS

| Admin section | What it controls |
|---|---|
| **Profile** | Name, photo, rotating hero roles, intro, About text, email, résumé PDF, social links |
| **Home layout** | Order and visibility of home sections; add new ones (cards, text block, "latest from a page", …); which ones appear in the nav |
| **Experience** | Roles with logo, cover, story (markdown), highlights, skills, **photo gallery**, **certificates/documents**; whether each counts toward years of experience |
| **Projects / Education / Publications / Skills** | Self-explanatory; projects can be *featured* on the home page |
| **Pages & blog** | Create pages from templates: **Blog**, **Photography/Gallery**, **Stories/Travel**, **Poetry**, **Single page**. Write posts, albums, stories and poems inside each one |
| **Settings** | Accent colour, SEO title and description, footer, **backup download/restore** |

Notes
- Uploaded images are resized and compressed in the browser (WebP, max 2000px) before upload.
- Every Save keeps the previous version in the `site_history` table (last 100), so you can restore an old version from Supabase if needed.
- Entry URLs look like `/<page-slug>/<entry-slug>`. Experience pages are `/experience/<slug>`, projects are `/projects/<slug>`.

## Project layout

```
src/
  lib/        types.ts (content model) · seed.ts (starter content) · store.ts (Supabase/local backend) · utils.ts (dates, durations)
  site/       public pages: Home, sections, ExperienceDetail, ProjectDetail, page templates, EntryView
  admin/      CMS: AdminApp (auth + shell), panels, PagesPanel (pages and entries), form fields
supabase/schema.sql
```
