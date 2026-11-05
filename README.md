# Fedexx — shipment registration and tracking prototype

This package is a deployable **internal shipment-record and public tracking prototype**. It is not affiliated with FedEx and is not connected to FedEx, DHL, UPS, airlines, customs, payment processors, vehicles, or a real delivery network. A tracking status is only as accurate as the staff member who enters it. Do not tell customers a parcel has physically moved unless your staff has verified that movement.

## Included
- Responsive public homepage and tracking page
- Staff dashboard at `/admin.html`
- Staff registration, search, status updates, ETA and public tracking notes
- Automatically generated tracking codes in the form `FXX-YYYYMMDD-XXXXXX`
- Public tracking history that does not expose customer phone numbers or street addresses
- English, Spanish, French and Portuguese language selector
- Netlify Functions API with Netlify Blobs storage

## Deploy on Netlify
1. Unzip this archive.
2. Open the folder `fedexx_package_system`.
3. Upload **the contents inside that folder** to the root of a new GitHub repository (not the outer folder itself).
4. Connect that repository to Netlify.
5. In Netlify, open **Site configuration → Environment variables** and add:
   - Key: `ADMIN_PASSWORD`
   - Value: a strong private password of at least 16 characters.
   - Scope: Functions (or all scopes if Netlify only offers that choice).
6. In Netlify build settings use:
   - Base directory: leave blank
   - Build command: leave blank
   - Publish directory: `public`
   - Functions directory: `netlify/functions`
7. Trigger a fresh deploy after adding the environment variable.
8. Visit `https://YOUR-SITE.netlify.app/` and then `https://YOUR-SITE.netlify.app/admin.html`.

## First test
1. Sign in to `/admin.html` using the private `ADMIN_PASSWORD`.
2. Register a fictional test shipment using test names and details only.
3. Copy its tracking code and test it on the public tracking page.
4. Delete the fictional test shipment from the dashboard.

## Important security and business notes
- Keep `ADMIN_PASSWORD` private. Do not put it in website source files or share it with customers.
- Public tracking only shows the tracking code, shipment description, current status, last known public location, estimated delivery date, public notes and status history. It does not reveal sender/receiver phone numbers or street addresses.
- This prototype is not a carrier booking or parcel movement service. Before accepting real shipments, arrange genuine delivery partners and verify business registration, licensing/permits, insurance, customer terms, privacy obligations, and operational procedures for each country you serve.
- Netlify Blobs is used for persistent shipment records. Deploy the site to Netlify; opening the files locally will not provide the server-side tracking database.
