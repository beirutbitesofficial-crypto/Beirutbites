# Beirut Bites

Website for **Beirut Bites**, a Lebanese street-food truck in Malmö — built with React + Vite, Firebase and GSAP.

The design is a cinematic "maison" style: cedar noir, ivory and saffron gold, Cormorant Garamond + Jost, an animated hero where the manakish rises into an arch with herbs, embers and steam, curtain reveals on scroll, and a footer signature that fills with gold and lights up like neon. Everything respects "reduce motion".

- **Website** (`index.html`): menu with search and categories, cart, WhatsApp ordering, live "open now" status, catering requests, loyalty points. Swedish, English and Arabic (right-to-left).
- **Admin panel** (`admin.html`): open/close the truck for the day, mark dishes as sold out, edit prices, dishes and photos, offers, opening hours, and confirm orders so customers get their points.

## Run it on your computer

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev
```

Open the address it prints (usually <http://localhost:5173>). The admin panel is at `/admin.html`.

## Put it online

```bash
npm run build
```

This creates a `dist/` folder. Upload **everything inside `dist/`** to `public_html` on your host (replace the old files).

You don't even need your own computer for this: every push to GitHub builds the site automatically. Open the **Actions** tab → the latest **Build** run → download **beirut-bites-website**, unzip it and upload the contents to `public_html`.

Using Firebase Hosting instead? `npm run build && firebase deploy`.

## Firebase setup (one time)

1. **Publish the database rules** — Firebase console → project `beirut-bites-fa6a0` → **Firestore Database → Rules** → paste the contents of [`firestore.rules`](firestore.rules) → **Publish**. Without this, the admin panel can't save and orders/points won't work.
2. **Sign-in methods** — **Authentication → Sign-in method**: enable **Email/Password** (and **Google** if customers should be able to use it). Under **Settings → Authorized domains**, add `beirutbites.shop` (and `www.beirutbites.shop`).
3. **Create the admin PIN** (once) — **Authentication → Users → Add user**:
   - Email: `admin@beirutbites.shop`
   - Password: `bb-` followed by your 4-digit PIN, e.g. `bb-1234` for PIN 1234

   Do this right away: until the account exists, someone else could create it.
4. **First admin login** — open `/admin.html`, type the PIN, and press **Spara och publicera** once to publish the menu.

The PIN can be changed later in the admin panel under **Inställningar → Byt PIN-kod**. The panel locks again when the browser tab is closed.

## Where to change things

| What | Where |
|---|---|
| Prices, dishes, photos, sold out, offers, opening hours | The admin panel — no code needed |
| WhatsApp number, admin e-mails, "login required to order" | [`src/config.js`](src/config.js) |
| Default menu (used before anything is saved in the admin panel) | [`src/data/menu.js`](src/data/menu.js) |
| Website texts (SV / EN / AR) | [`src/site/i18n.js`](src/site/i18n.js) |
| Admin panel texts | [`src/admin/i18n.js`](src/admin/i18n.js) |
| Colours and layout | [`src/site/site.css`](src/site/site.css), [`src/admin/admin.css`](src/admin/admin.css) |
| Hero animation and scroll effects | [`src/site/motion/`](src/site/motion) |
| Hero cut-out photos | [`public/images/hero/`](public/images/hero) |
| Photos | [`public/images/`](public/images) — use `.webp`, about 720 px wide |

**Admin login:** everyone who runs the truck uses the same 4-digit PIN. The PIN account is set in `src/config.js` (`ADMIN_LOGIN_EMAIL`) and in `isAdmin()` in `firestore.rules`; if you change one, change the other and publish the rules again.

## How orders and points work

1. The customer fills the cart and taps **Send order on WhatsApp**. The message includes an order number such as `#K7TQ`.
2. If the customer is logged in, the order also appears under **Beställningar** in the admin panel.
3. When the order is picked up, press **Bekräfta**. Only then are points added (1 point per krona), so customers can't give themselves points.
4. At 500 points the customer can request a free dish. It shows at the top of **Beställningar**; **Godkänn** deducts the 500 points.

## Project structure

```
index.html, admin.html     page shells (Vite entry points)
public/                    images, manifest, service worker (copied as-is)
src/config.js              settings you may want to change
src/firebase.js            Firebase connection
src/data/menu.js           default menu + settings helpers
src/lib/                   opening-hours logic, small helpers
src/site/                  the website (App.jsx, components/, i18n.js, site.css)
src/admin/                 the admin panel (AdminApp.jsx, views/, i18n.js, admin.css)
firestore.rules            database security rules
```
