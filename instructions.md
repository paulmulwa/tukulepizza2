# 🍕 Pizza In — Full App Prompt

---

## PROJECT OVERVIEW

- The app is called **Pizza In**
- It is a **web-based AR pizza menu** accessible via QR code scan
- No app download is required — runs entirely in the mobile browser
- Must work on **iOS Safari** and **Android Chrome**
- Must be hosted on **HTTPS** (required for camera and AR access)
- Built with **Next.js 14 (App Router)**, **Tailwind CSS**, and **model-viewer web component**
- Pizza data is stored in a local **JSON file**
- 3D models are stored as **.glb files** in the public folder

---

#BRANDING

App name: Pizza In
Primary color: Warm Yellow (#FFC244)
Accent color: Teal Green (#2D9E8F)
Background: White (#FFFFFF)
Secondary Background: Light Grey (#F7F7F7) — used for card backgrounds and section separators
Hero Section Background: Warm Yellow (#FFC244) — same wave style as reference
Text Primary: Dark Charcoal (#1E1E1E) — headings and pizza names
Text Secondary: Medium Grey (#555555) — descriptions and secondary info
Price Color: Teal Green (#2D9E8F)
Category Badge Background: tinted version of category color, dark text — no white text on light badges
Button Primary: Teal Green (#2D9E8F) background, White (#FFFFFF) text
Button Secondary: White (#FFFFFF) background, Teal Green (#2D9E8F) text and border
AR Button: Warm Yellow (#FFC244) background, Dark Charcoal (#1E1E1E) text
Font: Poppins (Google Fonts)
Logo: Text-based — "🍕 Pizza In" in bold Poppins, Dark Charcoal (#1E1E1E) color, top of every page
No dark backgrounds anywhere in the app — every surface is white, light grey, or warm yellow only
All shadows are light and subtle — rgba(0,0,0,0.08) — never dark or heavy
---

## DATA STRUCTURE

Each pizza object in the JSON must include:

- `id` — unique number
- `name` — full pizza name e.g. "Margherita"
- `slug` — URL-safe version e.g. "margherita"
- `category` — one of: Classic, Spicy, Meat Lovers, Veggie, Chef's Special
- `description` — 2 sentence description of the pizza
- `ingredients` — array of ingredient names e.g. ["Tomato Base", "Mozzarella", "Basil"]
- `thumbnail` — path to image e.g. `/images/margherita.jpg`
- `model` — path to 3D GLB file e.g. `/models/margherita.glb`
- `sizes` — object containing three size options:
  - `small` — includes label "Small", diameter "20cm", and price
  - `medium` — includes label "Medium", diameter "30cm", and price
  - `large` — includes label "Large", diameter "40cm", and price
- `tags` — array of dietary tags e.g. ["Vegetarian", "Bestseller"]

---

## PIZZA DATA (Seed with these 8 pizzas)

- **Margherita** — Classic — tomato base, mozzarella, fresh basil — Ksh 1200 / Ksh 1600 / Ksh 2000
- **Diavola** — Spicy — spicy salami, chili flakes, mozzarella — Ksh 1400 / Ksh 1800 / Ksh 2200
- **BBQ Beef** — Meat Lovers — BBQ sauce, beef, red onion, cheddar — Ksh 1600 / Ksh 2000 / Ksh 2400
- **Garden Fresh** — Veggie — roasted peppers, zucchini, olives, feta — Ksh 1300 / Ksh 1700 / Ksh 2100
- **Pepperoni Feast** — Meat Lovers — double pepperoni, mozzarella, oregano — Ksh 1500 / Ksh 1900 / Ksh 2300
- **Truffle Mushroom** — Chef's Special — truffle oil, wild mushrooms, parmesan — Ksh 1800 / Ksh 2200 / Ksh 2600
- **Hot Chicken** — Spicy — grilled chicken, jalapeños, hot sauce, mozzarella — Ksh 1500 / Ksh 1900 / Ksh 2300
- **Napolitana** — Classic — anchovies, capers, tomato, olives, mozzarella — Ksh 1300 / Ksh 1700 / Ksh 2100

---

## PAGE 1 — MENU LIST PAGE (Route: `/`)

### Layout & Structure
- Full dark background
- **Header** fixed at top containing:
  - Pizza In logo left-aligned
  - No other nav items
- **Category filter tabs** below header:
  - Tabs: All, Classic, Spicy, Meat Lovers, Veggie, Chef's Special
  - Horizontally scrollable on mobile
  - Active tab has red background and white text
  - Inactive tabs have dark background and grey text
  - Tapping a tab filters the list instantly with no page reload
- **Pizza list** below the tabs — full width vertical list

### Pizza Card (each item in the list)
- Full width horizontal card with subtle dark card background
- Thin divider line between each card
- **Left side** — square thumbnail image:
  - Size: 80x80px
  - Rounded corners (8px)
  - Object-fit cover
  - Slight shadow
- **Right side** — pizza details:
  - Pizza name in bold white 16px
  - Category badge — small pill shape, colored per category:
    - Classic → Green
    - Spicy → Red
    - Meat Lovers → Brown
    - Veggie → Yellow-Green
    - Chef's Special → Purple
  - Starting price displayed as `Ksh 12.00` in orange accent color
- **Entire card is tappable** → navigates to `/pizza/{slug}`
- Cards animate in with a subtle fade on load
- If category filter is active, non-matching cards are hidden instantly

---

## PAGE 2 — PIZZA DETAIL PAGE (Route: `/pizza/[slug]`)

### Header
- Back arrow `←` on top left — navigates back to menu list `/`
- "Pizza In" logo centered in header
- Header is fixed at top

### Thumbnail Section
- Full-width image at top of page below header
- Image height: 280px, object-fit cover
- Rounded bottom corners
- A pulsing **"👆 Tap to view in AR"** label overlaid at bottom center of image
- Tapping the image triggers the AR experience
- Image has a subtle dark gradient overlay at bottom for the label visibility

### Pizza Info Section (below thumbnail)
- Pizza name — large bold white text, 24px
- Category badge — same colored pill as on menu list
- Dietary tags displayed as small grey chips e.g. "Vegetarian", "Bestseller"
- Horizontal divider line
- Description paragraph — grey text, 14px, 2 lines
- Horizontal divider line

### Ingredients Section
- Section heading "INCLUDES" in small uppercase orange text
- Ingredients displayed as **pill chips** in a wrapping flex row:
  - Each chip has a dark background, white text, rounded corners
  - Each chip has a relevant emoji prefix e.g. 🧀 Mozzarella, 🍅 Tomato Base

### Size Selector Section
- Section heading "CHOOSE SIZE" in small uppercase orange text
- Three size buttons displayed in a row, equal width:
  - Each button shows: size name, diameter, price
  - Default selected: Medium
  - Selected state: red background, white text, slight scale-up
  - Unselected state: dark background, grey text, border
  - Tapping a size button:
    - Updates the selected size state
    - Updates the price shown in the AR button below
    - Remembers the chosen size when AR is opened

### AR Button
- Full-width button below size selector
- Label: "👁️ View in AR — Medium — Ksh 1600.00" (updates dynamically with size)
- Red background, white text, rounded corners, 18px
- Tapping this button triggers the same AR experience as tapping the thumbnail

---

## AR EXPERIENCE — Triggered from Detail Page

### Permission Handling
- When AR is triggered, the browser must request:
  - **Camera access** — to view the real world through the phone
  - **Device orientation and motion** — to track phone movement in 3D space
- If permission is denied:
  - Show a friendly overlay message: "Camera access is needed to view your pizza in AR. Please allow camera in your browser settings."
  - Provide a "Try Again" button that re-requests permission
- No GPS or location permission is required

### Device Compatibility Check
- Before launching AR, detect if the device supports WebXR or model-viewer AR:
  - If **iOS Safari** → use **AR Quick Look** via model-viewer `ar-modes="quick-look"`
  - If **Android Chrome with ARCore** → use **WebXR scene-viewer** via model-viewer `ar-modes="webxr scene-viewer"`
  - If **unsupported device** → open the pizza in an **interactive 3D viewer** (no AR) with a message: "AR is not supported on your device, but here's your pizza in 3D!"

### AR Launch Behavior
- model-viewer component is used with the following settings:
  - `ar` attribute enabled
  - `ar-modes` set to "webxr scene-viewer quick-look"
  - `ar-scale` set to **fixed** so the pizza renders at true real-world size
  - `camera-controls` enabled for non-AR 3D fallback
  - `shadow-intensity` set to 1 for realistic shadow on surface
  - `environment-image` set to neutral for realistic lighting
  - `auto-rotate` disabled once placed

### Surface Detection & Placement
- On Android (WebXR): app scans for a flat horizontal surface automatically
  - A **placement indicator ring** appears on detected surfaces
  - User taps the ring to place the pizza on that exact spot
  - Once placed, pizza is **anchored** to the surface and does not drift
- On iOS (AR Quick Look): Apple's native AR handles surface detection automatically
  - Pizza appears on the first flat surface detected
  - User can reposition by tapping elsewhere on the surface

### Pizza Sizing in AR (Critical)
- The 3D model base diameter is defined as **1 unit = 1 meter** in the GLB file
- Size scaling is applied as follows:
  - Small (20cm) → model scale: **0.20**
  - Medium (30cm) → model scale: **0.30**
  - Large (40cm) → model scale: **0.40**
- The selected size from the detail page is passed into the AR view as a URL parameter or state
- The model renders **immediately at the correct size** when placed — no default size then resize

### Size Toggle Inside AR
- Three floating overlay buttons always visible during AR session: **S / M / L**
- Positioned at bottom center of screen above the camera view
- Currently selected size is highlighted in red
- Tapping a different size:
  - Smoothly animates the model scale change over 300ms
  - Updates the highlighted button
  - Does not reset the pizza position on the surface
- Price label updates next to the size buttons

### Realism Features
- Pizza model casts a **soft shadow** directly onto the detected surface
- **Lighting estimation** is enabled — the pizza's lighting matches the room lighting via WebXR light estimation
- The pizza has **slight 3D depth** — not flat, has visible crust thickness and topping height
- Model textures must be **high resolution** baked top-down with realistic colors

### Back Navigation from AR
- A floating `← Back` button always visible in top left corner during AR
- Tapping back:
  - Closes the AR camera view
  - Returns user to the `/pizza/{slug}` detail page
  - Preserves the previously selected size
  - Does not navigate back to the menu list — only one step back

---

## NAVIGATION & BACK BUTTON RULES

- From **Menu List** → tap pizza card → go to `/pizza/{slug}`
- From **Pizza Detail** → tap thumbnail or AR button → open AR
- From **AR** → tap back → return to `/pizza/{slug}`
- From **Pizza Detail** → tap back arrow → return to `/` menu list
- Browser hardware back button must follow the same rules
- No step should skip a level — always one step at a time

---

## PERFORMANCE REQUIREMENTS

- All pizza thumbnail images must be **WebP format**, max 200KB each
- All GLB 3D models must be **under 5MB** each, optimized with Draco compression
- Menu list page must load in **under 2 seconds** on 4G mobile
- AR launch must begin within **3 seconds** of tapping
- All page transitions must be **smooth with no flash or blank screen**
- Category filter must respond in **under 100ms**

---

## RESPONSIVE DESIGN

- App is designed **mobile-first** — primary use is on phones
- Maximum content width: **480px** centered on larger screens
- All tap targets minimum **44x44px** for accessibility
- No horizontal scroll anywhere except category tab bar
- Text must never overflow cards

---

## ERROR STATES

- If a pizza slug does not exist → show "Pizza not found" with a back button to menu
- If a 3D model fails to load → show pizza thumbnail with message "3D preview unavailable"
- If camera permission is denied → show friendly message with retry option
- If internet is lost → show "You're offline. Please reconnect to view the menu"

---

## FOLDER STRUCTURE

```
/app
  /page.tsx              → Menu list page
  /pizza/[slug]/page.tsx → Pizza detail page
/components
  PizzaCard.tsx          → Single card component for menu list
  CategoryTabs.tsx       → Filter tabs component
  SizeSelector.tsx       → S/M/L size picker component
  ARViewer.tsx           → model-viewer AR wrapper component
  BackButton.tsx         → Reusable back navigation button
/data
  pizzas.json            → All pizza data
/public
  /images                → Pizza thumbnails (.webp)
  /models                → Pizza 3D models (.glb)
```

---

## QR CODE

- The QR code points to the root URL of the deployed app e.g. `https://pizzain.vercel.app`
- Generate after deployment using any free QR generator
- QR code opens directly in the phone browser — no app store
DATABASE — SUPABASE
Setup

Use Supabase as the database and image storage backend
All pizza data is fetched from Supabase — no local JSON file is used
All pizza thumbnail images are stored in Supabase Storage and served via Supabase public URLs
Environment variables required:

NEXT_PUBLIC_SUPABASE_URL — your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY — your Supabase anon public key




Database Table — pizzas
Create a table called pizzas in Supabase with the following columns:

id — int8, primary key, auto increment
name — text, not null
slug — text, not null, unique
category — text, not null — one of: Classic, Spicy, Meat Lovers, Veggie, Chef's Special
description — text, not null
ingredients — text[] (array of strings), not null
tags — text[] (array of strings)
thumbnail_url — text, not null — full public URL from Supabase Storage
model_path — text, not null — path to GLB file in /public/models/
price_small — numeric, not null
price_medium — numeric, not null
price_large — numeric, not null
created_at — timestamptz, default now()


Supabase Storage — pizza-images Bucket

Create a storage bucket called pizza-images
Set bucket to public so images are accessible via URL without auth
Upload all 8 demo pizza thumbnail images into this bucket
Each image is named to match its slug e.g. margherita.webp, diavola.webp
The public URL format will be:

https://<your-project>.supabase.co/storage/v1/object/public/pizza-images/margherita.webp


This full URL is stored in the thumbnail_url column for each pizza row


Seed Script — scripts/seed.ts

Create a seed script at scripts/seed.ts that:

Connects to Supabase using the service role key (not anon key — needs write access)
Reads demo pizza images from /public/images/ local folder
Uploads each image to the pizza-images Supabase Storage bucket
Gets the public URL for each uploaded image
Inserts all 8 pizza records into the pizzas table using the returned public image URLs
Logs success or error for each operation
Is safe to re-run — checks if a slug already exists before inserting (upsert)


Run the seed script with: npx ts-node scripts/seed.ts
Requires an additional env variable for seeding only:

SUPABASE_SERVICE_ROLE_KEY — never exposed to the frontend
use Ksh as curency and eb realistis pizza large is 2500, medium is 1000 and small is 750 but ensure they vary incategories but that is the range