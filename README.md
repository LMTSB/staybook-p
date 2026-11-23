# SpatialStay 3D — Reworked 3-Step Booking & QR Payment Prototype (v2)

## Workflow Overview
1. **Login Page (`#login`)**: Email + OTP (`123456`) or Instant Demo Sign-In.
2. **Booking & 3D Explorer Page (`#booking`)**:
   - Switch between 3 true-to-scale Bangkok rooms (`The Urban Sanctuary 38 m²`, `The Calm Residence 32 m²`, `The Grand Atelier 55 m²`).
   - Inspect each room in **3D Cutaway**, **Eye-Level 360° (1.65 m)**, **Architectural Floor Plan**, and **Window View** (Day / Sunset / Night) with 3D physical dimension lines (`📏 3D Dimensions`) and 5 interactive pins (Bed, Window, TV, Workspace, En-suite Bathroom).
   - Configure dates, adults/children, room count, OTA-style rate plans (Room Only, Free Cancellation, Breakfast + Free Cancellation), and stay preferences with live tax/fee preview.
3. **Booking Confirmation & Payment Page (`#payment`)**:
   - Full reservation review, primary guest form, itemized tax & fee breakdown (`5%` service fee + `7%` VAT), and 4 payment methods: **Thai QR Payment (PromptPay)** with dynamic SVG QR code, **Credit/Debit Card**, **Mobile Banking App**, and **Pay at Property**.
4. **E-Receipt (`#confirmation`) & Universal Back Navigation**:
   - Every page includes a **← Return to previous page** button and synchronizes with browser `history.pushState` / `popstate`.

## Run Locally
1. Extract `staybook-3d-prototype-v2.zip`.
2. Run `python -m http.server 8000` inside the folder and open `http://localhost:8000`.
3. To publish a public shareable link immediately, drag and drop `staybook-3d-prototype-v2.zip` onto `https://app.netlify.com/drop`.
