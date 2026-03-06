# Web App (Frontend)

> **React + Vite + Tailwind CSS** single-page application for the CFC platform. This is the user-facing frontend consumed by candidates, admins, coordinators, and super admins.

## What This App Does
- **Public pages**: Home, Catalogue (with pagination + filters), Formation Detail, Login, Registration (3-step wizard)
- **Candidate dashboard**: Inscription tracking, Notifications, Profile management
- **Admin dashboard**: Formation management (CRUD via modal), Dossier review (accept/refuse), Statistics
- **Super Admin dashboard**: Establishment management, Admin accounts, Global config, Reporting
- **Role-based routing**: AuthContext + ProtectedRoute guards
- **Mobile responsive**: Hamburger menu for mobile viewports

## Tech Stack
| Component | Technology |
|-----------|-----------|
| Framework | React 18 |
| Build tool | Vite 6 |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| Container | Docker + Nginx |

## Prerequisites
- **Node.js 18+** and **npm**
- Backend services running (or API Gateway at `http://localhost:3001`)

## Setup

### 1. Install dependencies
```bash
cd services/web-app
npm install
```

### 2. Run development server
```bash
npm run dev
# Opens at http://localhost:3000
```

### 3. Build for production
```bash
npm run build
# Output in dist/
```

### 4. Run with Docker
```bash
docker compose up --build
# Serves at http://localhost:8080
```

## Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | API Gateway base URL | `http://localhost:3001` |

## Project Structure
```
web-app/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.jsx                    # Entry point (providers)
│   ├── App.jsx                     # Routes (12 total)
│   ├── index.css                   # Tailwind directives
│   ├── context/
│   │   └── AuthContext.jsx         # Auth state + role helpers
│   ├── components/
│   │   ├── Navbar.jsx              # Role-based navbar + mobile menu
│   │   ├── Footer.jsx
│   │   ├── ProtectedRoute.jsx      # Route guard
│   │   └── ui/                     # 14 reusable components
│   │       ├── Button.jsx          # 6 variants, 3 sizes, Link support
│   │       ├── Input.jsx           # Label + focus ring
│   │       ├── Select.jsx          # Options array + placeholder
│   │       ├── Badge.jsx           # 5 color variants
│   │       ├── Card.jsx            # Optional hover animation
│   │       ├── PageHeader.jsx      # Gradient header
│   │       ├── Table.jsx           # Table + TableRow + TableCell
│   │       ├── Sidebar.jsx         # Dark nav + active state
│   │       ├── StatCard.jsx        # Stat display
│   │       ├── UploadZone.jsx      # Drag-drop file area
│   │       ├── Modal.jsx           # Dialog overlay
│   │       ├── Pagination.jsx      # Page nav with ellipsis
│   │       ├── Toast.jsx           # Notification system (Provider)
│   │       ├── Spinner.jsx         # Loading + EmptyState
│   │       └── index.js            # Barrel export
│   └── pages/
│       ├── Home.jsx
│       ├── Catalogue.jsx           # Pagination + advanced filters
│       ├── FormationDetail.jsx
│       ├── Login.jsx               # Demo role selector
│       ├── Register.jsx            # 3-step wizard
│       ├── Profile.jsx
│       ├── Notifications.jsx
│       ├── DashboardCandidat.jsx
│       ├── DashboardAdmin.jsx      # + FormationForm modal
│       ├── DashboardSuperAdmin.jsx
│       ├── DossierDetail.jsx       # Documents + timeline
│       ├── FormationForm.jsx       # Create/edit modal
│       └── NotFound.jsx            # 404
├── Dockerfile
├── nginx.conf
└── docker-compose.yml
```

## Routes
| Path | Access | Page |
|------|--------|------|
| `/` | Public | Home |
| `/catalogue` | Public | Catalogue (pagination + filters) |
| `/formations/:id` | Public | Formation Detail |
| `/login` | Public | Login (with demo role picker) |
| `/inscription` | Public | Registration (3 steps) |
| `/profil` | Any authenticated | Profile editor |
| `/notifications` | Any authenticated | Notification list |
| `/dashboard` | `CANDIDAT` | Candidate dashboard |
| `/admin` | `ADMIN_ETAB` / `COORDINATEUR` | Admin dashboard |
| `/admin/dossiers/:id` | `ADMIN_ETAB` / `COORDINATEUR` | Dossier detail |
| `/super-admin` | `SUPER_ADMIN` | Super Admin dashboard |
| `*` | Public | 404 |

## What Other Devs Need To Do
1. **API Gateway** must be running at `VITE_API_URL` and proxy to backend services
2. **Auth Service** must expose `POST /api/auth/login` returning a JWT with `{ role, user_id, nom, email }`
3. Replace the **demo login** (role selector) with real API calls once the Auth Service is ready
4. Replace **sample data** in pages with real API calls (`fetch` / `axios`) once backend services are running
5. **Document Service** must accept `multipart/form-data` uploads from the Register page step 3
