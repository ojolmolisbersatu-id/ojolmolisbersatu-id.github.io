# OMB V2
Integrated Membership Management System for Ojol Molis Bersatu.

Stack: React + Vite + Supabase + GitHub Pages.

Frontend only uses VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. NEVER put a service_role key in this repository.

Current UI includes public website, registration, login, forgot-PIN UI, member portal, admin portal, public member verification, and Supabase/Edge Function service wrappers.

Backend note: final forgot-PIN recovery-token/set-PIN flow is intentionally not considered complete until the remaining Edge Functions are finished.
