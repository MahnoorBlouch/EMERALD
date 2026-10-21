# Emerald website (static, Phase 2)

Plain HTML, CSS and JavaScript. No build step, no frameworks, no tracking.

```
emerald-website/
├── index.html            page structure, SEO tags
├── css/style.css         all styles
├── js/projects.js        project data and image sizes (edit here)
├── js/events.js          privacy-safe event hook (sends nothing by itself)
├── js/main.js            menu, projects, project pages, WhatsApp links, form
├── api/contact.js        OPTIONAL email-sending function (off until you switch it on, see below)
├── images/               logo and project photos (each has a -480.webp small version)
├── Emerald-Portfolio.pdf company portfolio
├── robots.txt
└── vercel.json           preview settings (noindex, caching, security headers)
```

## Edit a project
Open `js/projects.js`. Fields: `slug`, `name`, `area`, `status` (`completed`, `ongoing`, `future`), `tag`, `desc`, `img`.
Optional: `year`, `size`, `floors` (shown on the project page only when present) and `gallery`.
New photo: save a `.webp` in `images/projects/`, also a 480px-wide copy named `<name>-480.webp`, and add its width and height to `window.IMG_DIMS` at the bottom of `projects.js`.

## Deploy a Vercel preview (no domain needed)
1. **GitHub:** create a new repository (make it Private). Upload everything inside the `emerald-website` folder so that `index.html` sits at the top level of the repository.
2. **Vercel:** go to vercel.com, sign in with GitHub, click Add New, then Project, and import the repository.
3. **Settings:** Framework Preset **Other**. Leave Build Command, Output Directory and Install Command empty (Root Directory stays `./`).
4. Click **Deploy**. After about a minute Vercel shows a `*.vercel.app` address.
5. Open that address on your phone and on a computer and go through the checklist below.
6. Send the same address to the client for review.

Without GitHub: install the Vercel CLI and run `vercel` inside this folder, accepting the defaults.

## Keep the preview from being found
A `*.vercel.app` address is **public** unless you protect it. Anyone who has the link can open it, and the site contains information the client has not approved yet.
- `vercel.json` already sends `X-Robots-Tag: noindex, nofollow`, which asks search engines not to list the preview. It does not stop people from opening it.
- To restrict access, look at **Project Settings, Deployment Protection** in Vercel. Which options (Vercel login, password) are available depends on your Vercel plan, so check it in the dashboard.
- Share the link only with the client.
- **Before the real launch:** delete the `X-Robots-Tag` entry from `vercel.json`, otherwise Google will never list the site.

## Test checklist on the live preview
- Menu on Android and iPhone, project filters, every project page, the photo gallery.
- Project pages: the "Ask about this project" button opens WhatsApp with the right number (0345-0007888).
- The contact form (see below): wrong entries show errors; a correct entry opens your email app, or sends the email once the email service is switched on.
- Phone links start a call. The portfolio button opens the PDF.
- Chrome DevTools, Lighthouse, mobile: write down the four scores.

## Contact form (email)
The form asks for Name, Email, Subject and Message and validates all four.
**Today (no setup):** pressing Send Message opens the visitor's own email app with the message addressed to emeraldbuilders888@gmail.com. The page says clearly that nothing has been sent until the visitor presses Send there. It never shows a "sent" message in this mode.

**To send real emails from the website (needs the client's approval, because a third-party service handles names and email addresses):**
1. Create an account at resend.com and an API key.
2. Choose the sender address. It must belong to a domain verified in Resend (so this needs the final domain; check Resend's documentation for what its test sender allows).
3. In Vercel, Project Settings, Environment Variables, add `RESEND_API_KEY`, `CONTACT_TO` (the company inbox) and `CONTACT_FROM`. Redeploy.
4. In `index.html`, change `data-endpoint=""` on the form to `data-endpoint="/api/contact"`.
5. Submit the form on the live preview and confirm the email arrives. Only then does the page show "Your message was sent".
The function has no rate limit. Add one if spam appears.
Alternative: put a form-service address (for example Formspree) in `data-endpoint`. It must accept a JSON POST and answer with a success status.

## Domain and launch (only after the client approves)
Do not buy or connect a domain until the client signs off. After approval see `project-docs/PHASE2-REPORT.md`, section 8, for the domain-dependent SEO tasks (canonical, sitemap, social image, structured data, Search Console).
