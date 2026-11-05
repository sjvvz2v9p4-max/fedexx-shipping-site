# Fedexx website — Vercel edition

This is a shipment-record and tracking prototype. It is not connected to FedEx, DHL, airlines, customs, payment providers, or real parcel movement. Staff must enter verified updates.

## Deploy
1. Import this repository into Vercel with Root Directory `./`.
2. Framework Preset: Other. Build Command: leave blank. Output Directory: `public`.
3. In the Vercel project, open Storage → Create Database → Blob. Choose **Private** access and connect it to this project. Vercel should add `BLOB_READ_WRITE_TOKEN`.
4. In Settings → Environment Variables, add `ADMIN_PASSWORD` with a private password of at least 16 characters. Do not share it.
5. Redeploy after adding storage and environment variables.
6. Open `/admin.html` to sign in; public tracking is at `/tracking.html`.

Shipment records are stored in a private Vercel Blob store. Public tracking returns only the tracking code, description, status, public location, ETA, and update history; it does not return sender/receiver phone numbers or street addresses.

## Notes
Use fictional test records until your business, delivery partners, permissions, insurance, privacy notice, and terms are in place. This prototype does not verify physical delivery.
