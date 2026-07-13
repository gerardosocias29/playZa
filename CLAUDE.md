# PlayZa

Project context file for Claude Code. This describes the system so Claude can scaffold, build, and extend it consistently.

## Project Overview

**PlayZa** is a reservation and scheduling system for Getafe sports facilities. It has two roles — **Admin** and **User** — both served as a single-page web app.

## Tech Stack

- **Backend**: Laravel (latest LTS)
- **Frontend**: Inertia.js + React (Laravel's official SPA adapter — controllers return Inertia responses that render React pages, no separate REST API, no CORS, no separate token auth)
- **Styling**: Tailwind CSS (ships with the Laravel + Inertia + React starter kit)
- **Database**: MySQL
- **Auth**: Laravel Breeze's Inertia + React starter kit, extended with a `role` field (`admin` | `user`) and middleware to separate dashboards

Keep the whole thing as simple as possible. One Laravel codebase, one npm build, no separate frontend project, no real-time features, no push notifications.

## User Roles & Flows

### Admin
1. **Login** — enter username/password → verify credentials → invalid message on failure → Dashboard on success
2. **User Management** — View Users → Approve Registration, Edit User, Delete User
3. **Facility Management** — Add Facility → Edit Facility, Delete Facility, Update Facility Availability
4. **Reservation Management** — View Reservations → decide Approve or Reject:
   - Approve Reservation
   - Reject Reservation
   - Cancel Reservation → triggers Send Notification to the user
5. **Schedule Management** — View Schedule → Update Schedule (must prevent double booking — validate no overlapping reservation exists for the same facility/time slot before saving)
6. **Reports** — Reservation Reports, User Reports, Facility Reports, Schedule Reports (simple filtered tables, exportable to CSV/PDF if time allows, otherwise on-screen only)

### User
1. **Register** → account verification step (admin approves new registrations, see Admin > Approve Registration) → Login
2. **Login** — same verify-credentials flow as Admin, separate dashboard
3. **View Schedule** — see facility availability/schedule
4. **Reservation**:
   - View Facilities → Check Facility Availability → Reserve Facility
   - View Reservation → Cancel Reservation, Reservation History
5. **Notifications** — Receive Approval Notification, Receive Rejection Notification (simple in-app notification list, no push/email required)
6. **Profile** — View Profile → Edit Profile → Change Password
7. **Logout**

## Database Schema (MySQL via Laravel migrations)

- `users`: id, name, email, password, role (enum: admin, user), status (enum: pending, approved, rejected), created_at, updated_at
- `facilities`: id, name, description, capacity, availability (boolean/active flag), created_at, updated_at
- `schedules`: id, facility_id (FK), date, start_time, end_time, status, created_at, updated_at
- `reservations`: id, user_id (FK), facility_id (FK), schedule_id (FK), date, status (enum: pending, approved, rejected, cancelled), created_at, updated_at
- `notifications`: id, user_id (FK), reservation_id (FK), type (enum: approval, rejection), message, is_read (boolean), created_at

## Routes / Controllers (suggested structure)

Controllers return `Inertia::render('PageName', [...props])` instead of Blade views. Each "page" corresponds to a React component in `resources/js/Pages`.

- `AuthController` — login, register, logout (Breeze's Inertia + React starter kit scaffolds this)
- `Admin\UserController` — index (view users), approve, edit, destroy
- `Admin\FacilityController` — index, store, edit, update, destroy, updateAvailability
- `Admin\ReservationController` — index, approve, reject, cancel
- `Admin\ScheduleController` — index, update (with double-booking validation)
- `Admin\ReportController` — reservations, users, facilities, schedules (each a simple index method with filters)
- `User\FacilityController` — index (view facilities), checkAvailability
- `User\ReservationController` — store (reserve), index (view reservations), cancel, history
- `User\NotificationController` — index
- `User\ProfileController` — show, edit, update, changePassword

Middleware: `role:admin` and `role:user` (or Laravel policies) to separate dashboard access — never let a user hit an admin route by guessing a URL.

## Frontend Structure (React + Inertia)

- `resources/js/Pages/Admin/*` — Dashboard, Users, Facilities, Reservations, Schedules, Reports
- `resources/js/Pages/User/*` — Dashboard, Facilities, Reservations, Notifications, Profile
- `resources/js/Layouts/` — `AdminLayout.jsx`, `UserLayout.jsx` (shared nav/sidebar per role)
- `resources/js/Components/` — reusable pieces (status badge, facility card, form inputs)
- Use Inertia's `<Link>` and `useForm` helper for navigation and form submissions — avoids writing fetch/axios calls by hand
- Use Inertia's shared data (`HandleInertiaRequests` middleware) to pass the logged-in user and role to every page, so layouts can conditionally render admin vs user nav without extra requests

## Key Business Rules

- **Prevent double booking**: before saving a schedule update or a reservation, check for overlapping `schedule`/`reservation` records on the same `facility_id` and time range. Reject with a clear validation error if a conflict exists.
- **Registration approval**: new users start as `status = pending` and cannot log in until an admin approves them (`status = approved`). Rejected accounts (`status = rejected`) should show a clear message on login attempt.
- **Reservation lifecycle**: `pending` → `approved` or `rejected` (by admin) → user can `cancel` their own reservation at any stage before the scheduled date if it's still pending or approved. Admin can also cancel any reservation.
- **Notifications**: whenever a reservation status changes (approved/rejected/cancelled), create a `notifications` row for that user. No email/push required — just show it in their in-app notification list.

## Conventions

- Use Laravel's standard resourceful routing (`Route::resource`) where it fits instead of hand-rolling custom routes.
- Use Form Requests for validation (`php artisan make:request`) rather than validating inline in controllers.
- Use small, reusable React components (reservation status badge, facility card, form inputs) rather than copy-pasting JSX.
- Seed the database with sample facilities, schedules, and a demo admin + user account for easy local testing (`database/seeders`).

## Setup

1. `composer install`
2. `npm install`
3. Copy `.env.example` to `.env`, set MySQL credentials
4. `php artisan key:generate`
5. `php artisan migrate --seed`
6. `npm run dev` (Vite dev server for React/Tailwind)
7. `php artisan serve`
8. Login with seeded demo accounts (document these in the seeder or README once created)