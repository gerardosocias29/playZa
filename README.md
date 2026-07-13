# PlayZa

A reservation and scheduling system for **Getafe sports facilities** — thesis project.
Built with **Laravel + Inertia.js + React + Tailwind CSS**. This version is the **UI only** (mock data in localStorage, no backend/database yet).

Two roles in one app:
- **User** — check facility availability, reserve slots, track reservations, read notifications.
- **Admin** — manage users, facilities, schedules, reservations, and download system reports.

---

## Requirements

- **PHP** (>= 8.2) & **Composer** — https://getcomposer.org
- **Node.js** (>= 18.0) & **NPM** — https://nodejs.org

---

## Run it

From the project folder (`playZa`), run the setup commands (first time only):

```bash
composer install                    # download PHP dependencies
npm install --legacy-peer-deps      # download JS dependencies
copy .env.example .env              # create environment file
php artisan key:generate            # generate application key
```

To run the application in development (runs backend and hot-reloading asset server):

1. Start the Laravel backend server:
   ```bash
   php artisan serve
   ```
2. Start the Vite asset dev server (in a separate terminal window):
   ```bash
   npm run dev
   ```

Alternatively, you can compile the assets for production and run only the PHP server:

```bash
npm run build        # compile assets once
php artisan serve    # runs only the PHP server
```

Open your browser and navigate to: **`http://127.0.0.1:8000`**

---

## How to use the app

1. Log in manually on the **Login** screen using any of the following credentials:
   - **Admin:** `admin@playza.com` (password: `admin123`)
   - **User:** `user@playza.com` (password: `user123`)
   - **Pending User:** `pending@playza.com` (password: `pending123`)
2. **User:** select a facility → select date → click an available slot → request booking. It appears as **Pending** under *My reservations*.
3. **Admin:** open *Reservations* → click **Approve** or **Reject** on the pending request.
4. **User:** log back in → check the **Notifications** bell or inbox to see the approval/rejection alert.

---

## Project layout

```
routes/
└── web.php                     # mockup routes (returns Inertia page renders)
resources/
├── css/
│   └── app.css                 # custom styles, light theme, animations
├── js/
│   ├── app.jsx                 # react entry point
│   ├── bootstrap.js            # axios config
│   ├── mockData.js             # localStorage state manager & seed data
│   ├── Layouts/
│   │   ├── AdminLayout.jsx     # admin navigation dashboard shell
│   │   └── UserLayout.jsx      # user navigation dashboard shell
│   └── Pages/
│       ├── Welcome.jsx         # landing page
│       ├── Dashboard.jsx       # client-side role router redirect
│       ├── Auth/               # Login, Register pages
│       ├── Admin/              # admin pages (Dashboard, Users, Facilities, Reservations, Schedules, Reports)
│       └── User/               # user pages (Dashboard, Facilities, Reservations, Notifications, Profile)
```

All data is managed and stored in the browser's `localStorage` via `resources/js/mockData.js`. Double-booking checks are validated client-side automatically.

---

## Common commands

```bash
npm run dev        # run Vite dev server
npm run build      # compile assets for production
php artisan serve  # run Laravel backend server
```
