# SpacialStay 3D — Booking MVP Prototype

## Run locally
1. Extract `staybook-3d-prototype.zip`.
2. Open a terminal in the extracted folder.
3. Run `python -m http.server 8000` and visit `http://localhost:8000`.
4. A local HTTP server (or static web host) is required because `room3d.js` loads as an ES module (`<script type="module">`).

No npm install or build step is required. The 3D room viewer (Three.js), fonts, and sample photos load from external CDNs/services, so an internet connection is required.

## Publish a public shareable link (30 seconds)
- **Netlify Drop:** Visit `https://app.netlify.com/drop` and drag-and-drop `staybook-3d-prototype.zip` (or the extracted folder) to immediately receive a public `https://` URL.
- **GitHub Pages / Vercel / Cloudflare Pages:** Upload the extracted files to any static site host with `index.html` at the root.

## Demo flow
- **Login:** Enter any valid email format and use demo code `123456`.
- **Browse:** Choose check-in/check-out dates and guest count; select any of the 3 Bangkok listings.
- **Room detail & 3D Viewer:**
  - Drag to orbit 360°, scroll or pinch to zoom, and switch between **Room 3D**, **3D floor plan** (architectural cutaway), and **Window view**.
  - Click the 3D-tracked hotspots (`1` Bed, `2` Window view, `3` Smart TV, `4` Workspace) or camera presets to smoothly focus the camera and inspect feature dimensions.
  - Toggle **☀ Day**, **🌇 Sunset**, and **☾ Night** lighting, or **📏 Dimensions** to inspect room measurements.
- **Payment & Confirmation:** Calculates nightly subtotal, 5% demo service fee, and 7% demo VAT on subtotal plus service fee, ending with a simulated booking reference.

## Interactive 3D room implementation
The room viewer (`room3d.js`) uses Three.js and `OrbitControls` (resolved via `<script type="importmap">` in `index.html`) to render an interactive procedural 3D room tailored to each listing:
- **The Urban Sanctuary (38 m², King bed):** East-facing Sukhumvit high-rise skyline view.
- **The Calm Residence (32 m², Queen bed):** Courtyard-facing Ari garden neighbourhood view.
- **The Grand Atelier (55 m², King bed):** West-facing Chao Phraya river view with an additional suite lounge area.

This is a **procedural 3D concept model**, not a laser scan or dimensionally verified digital twin. Replace with property-measured glTF/GLB models and verified window captures before production launch.

## Files
- `index.html` — Page structure, import map, booking steps, and 3D viewer container
- `styles.css` — Responsive design and 3D overlay styling
- `app.js` — Sample room data, navigation, date validation, pricing, and room-open event dispatch
- `room3d.js` — Three.js ES module for the interactive 3D room, 3D-projected hotspots, lighting modes, and dimension tags
- `PROJECT_REVIEW.md` — Product and technical review
- `COMPETITORS.md` — Direct and adjacent competitor landscape
