# No-Code Dynamic Form Builder

Production-oriented full stack form platform built with React, Create React App, Express, Node.js, MySQL, and Tailwind CSS.

## What This Project Includes

- Admin form builder with button-based and drag-enabled field creation
- Supported fields: text, textarea, dropdown, radio, checkbox, date
- Field editing: label, placeholder, required toggle, options
- Reordering and deleting fields
- Live form preview
- Form management: create, edit, duplicate, delete
- Public form route: `/form/:id`
- MySQL persistence for forms and responses
- Analytics dashboard with table view and CSV export
- Analytics dashboard with total response count and latest submission timestamp
- Tailwind-based responsive UI with admin sidebar layout
- Theme controls for light and dark visual direction, colors, and font family

## Folder Structure

```text
No-Code-Form-master/
├── backend/
│   ├── controllers/
│   │   ├── formController.js
│   │   └── responseController.js
│   ├── middleware/
│   │   └── errorHandlers.js
│   ├── routes/
│   │   ├── formRoutes.js
│   │   └── responseRoutes.js
│   ├── utils/
│   │   └── formHelpers.js
│   ├── .env.example
│   ├── db.js
│   ├── package.json
│   ├── schema.sql
│   └── server.js
├── src/
│   ├── components/
│   │   ├── AdminDashboard.jsx
│   │   ├── DragZone.jsx
│   │   ├── DraggableElement.jsx
│   │   ├── FieldEditor.jsx
│   │   ├── FormBuilder.jsx
│   │   ├── FormPreview.jsx
│   │   ├── FormRenderer.jsx
│   │   └── ThemeCustomizer.jsx
│   ├── context/
│   │   └── FormBuilderContext.jsx
│   ├── lib/
│   │   └── formUtils.js
│   ├── pages/
│   │   ├── AdminForms.jsx
│   │   ├── FormFill.jsx
│   │   └── Home.jsx
│   ├── api.js
│   ├── App.js
│   ├── index.css
│   └── index.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── README.md
```

## Environment Setup

### Frontend `.env`

Copy `.env.example` to `.env` in the project root.

```env
REACT_APP_PUBLIC_APP_URL=http://localhost:3000
REACT_APP_API_BASE_URL=
```

- `REACT_APP_PUBLIC_APP_URL`: the real app domain used for share links.
- `REACT_APP_API_BASE_URL`: optional full API base URL for split deployments, for example `https://api.yourdomain.com/api`.
- If frontend and backend are deployed on the same domain, leave `REACT_APP_API_BASE_URL` empty.

### Backend `.env`

Copy `backend/.env.example` to `backend/.env` and update the values.

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=dynamic_form_builder
MYSQL_SSL=false
MYSQL_SSL_REJECT_UNAUTHORIZED=true
MYSQL_SSL_CA=
MYSQL_SSL_CA_PATH=
NODE_ENV=development
```

- `CLIENT_ORIGIN`: allowed frontend origin. Use a comma-separated list if needed.
- `NODE_ENV=production`: makes Express serve the built frontend from `/build` when present.
- `MYSQL_SSL=true`: enables TLS for hosted databases like TiDB Cloud.
- `MYSQL_SSL_CA` or `MYSQL_SSL_CA_PATH`: optional CA certificate content or file path.

### TiDB Cloud backend config

TiDB Cloud is MySQL-compatible, so the existing backend works with it once TLS is enabled.

Example `backend/.env` for TiDB Cloud:

```env
PORT=5000
CLIENT_ORIGIN=https://forms.yourdomain.com
MYSQL_HOST=gateway01.us-east-1.prod.aws.tidbcloud.com
MYSQL_PORT=4000
MYSQL_USER=xxxxxxxx.root
MYSQL_PASSWORD=your_tidb_password
MYSQL_DATABASE=dynamic_form_builder
MYSQL_SSL=true
MYSQL_SSL_REJECT_UNAUTHORIZED=true
MYSQL_SSL_CA_PATH=/absolute/path/to/isrgrootx1.pem
NODE_ENV=production
```

TiDB Cloud steps:

1. Create a TiDB Cloud cluster or serverless project.
2. Create the database `dynamic_form_builder`.
3. Add your server IP to the TiDB Cloud allowlist.
4. Download the CA certificate if your TiDB connection details require it.
5. Put the TiDB host, port, user, password, and SSL settings into `backend/.env`.
6. Run your schema against TiDB, then start the backend.

The backend uses `mysql2`, so no ORM migration is required.

## Backend Setup First

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Configure MySQL and backend env

Create `backend/.env` from `backend/.env.example`.

### 3. Create the database schema

Run `backend/schema.sql` in your MySQL server before starting the API.

### 4. Start the API server

```bash
cd backend
npm run dev
```

### Backend Architecture

- `server.js`: Express bootstrap, middleware, route registration
- `db.js`: MySQL connection pool bootstrap using `mysql2`
- `schema.sql`: MySQL tables and indexes for forms and responses
- `controllers/`: route handlers and business logic
- `routes/`: REST endpoints
- `middleware/errorHandlers.js`: centralized error responses
- `utils/formHelpers.js`: field normalization and validation helpers

### Backend API Endpoints

- `POST /api/forms`
- `GET /api/forms`
- `GET /api/forms/:id`
- `PUT /api/forms/:id`
- `DELETE /api/forms/:id`
- `POST /api/responses`
- `GET /api/responses/:formId`

### MySQL Tables

#### `forms`

- `name`
- `description`
- `share_slug`
- `fields_json`
- `theme_json`
- `created_at`
- `updated_at`

#### `responses`

- `formId`
- `answers_json`
- `submitted_at`

## Frontend Setup Second

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Start the React app

```bash
npm start
```

The frontend uses the proxy configured in `package.json` to reach the backend at `http://localhost:5000`.

## Production Deployment

### Same-domain deployment

Use this when the Express backend serves the frontend build.

1. Set root `.env`:

```env
REACT_APP_PUBLIC_APP_URL=https://forms.yourdomain.com
REACT_APP_API_BASE_URL=
```

2. Set `backend/.env`:

```env
PORT=5000
CLIENT_ORIGIN=https://forms.yourdomain.com
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=dynamic_form_builder
NODE_ENV=production
```

3. Build the frontend:

```bash
npm run build
```

4. Start the backend:

```bash
cd backend
npm start
```

5. Put Nginx, Apache, or a cloud load balancer in front of the backend and point your real domain to it.

In this mode:
- Express serves the built frontend
- API requests stay on the same domain
- Share links use `REACT_APP_PUBLIC_APP_URL`

### Split frontend and backend deployment

Use this when frontend and backend are hosted on different domains.

Root `.env`:

```env
REACT_APP_PUBLIC_APP_URL=https://forms.yourdomain.com
REACT_APP_API_BASE_URL=https://api.yourdomain.com/api
```

Backend `.env`:

```env
CLIENT_ORIGIN=https://forms.yourdomain.com
NODE_ENV=production
```

In this mode:
- share links point to the real frontend domain
- API calls go to the real backend domain
- CORS allows the configured frontend origin

### Deploy backend on Render

This repo now includes [render.yaml](render.yaml) for deploying the backend service on Render.

#### Option 1: Blueprint deploy

1. Push this repo to GitHub.
2. In Render, choose `New` -> `Blueprint`.
3. Select your repository.
4. Render reads `render.yaml` and creates the backend web service.

#### Option 2: Manual web service

If you do not use the blueprint file, create a `Web Service` in Render with:

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/health`

#### Render environment variables

Set these in Render for the backend service:

```env
NODE_ENV=production
CLIENT_ORIGIN=https://forms.yourdomain.com
MYSQL_HOST=gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com
MYSQL_PORT=4000
MYSQL_USER=your_tidb_user
MYSQL_PASSWORD=your_tidb_password
MYSQL_DATABASE=dynamic_form_builder
MYSQL_SSL=true
MYSQL_SSL_REJECT_UNAUTHORIZED=true
MYSQL_SSL_CA=
MYSQL_SSL_CA_PATH=
```

Notes:

- `CLIENT_ORIGIN` should be your frontend domain.
- For TiDB Cloud, keep `MYSQL_SSL=true`.
- Use either `MYSQL_SSL_CA` or `MYSQL_SSL_CA_PATH` if TiDB requires a CA certificate.
- Render provides `PORT` automatically, so you do not need to set it manually.

#### After deploy

1. Open the Render service URL.
2. Check `/api/health`.
3. If the service boots but cannot connect to TiDB, add Render's outbound IP details to the TiDB allowlist if required by your TiDB setup.
4. Point your frontend `REACT_APP_API_BASE_URL` to the Render backend URL, for example `https://your-backend.onrender.com/api`.

## Frontend Architecture

### State Management

The app uses Context API through `src/context/FormBuilderContext.jsx` for:

- loading form lists
- selecting the active form
- saving and duplicating forms
- deleting forms
- loading analytics responses

### Component Responsibilities

- `AdminDashboard.jsx`: admin layout, actions, analytics table
- `FormBuilder.jsx`: field palette, ordering, deletion, schema editing shell
- `FieldEditor.jsx`: selected field property editor
- `FormPreview.jsx`: live admin preview
- `FormRenderer.jsx`: shared dynamic form renderer for preview and public use
- `ThemeCustomizer.jsx`: light/dark and color controls

## How The Flow Works

### Admin flow

1. Open `/admin/forms`
2. Create or select a form
3. Add fields from the library
4. Edit field details in the field editor
5. Save to MySQL
6. Copy or open the public share link
7. Load analytics, inspect the latest submission timestamp, and export CSV

### Public flow

1. Open `/form/:id`
2. Render schema-driven form fields
3. Validate required answers
4. Submit to `POST /api/responses`
5. View submissions in the admin dashboard

## Notes

- The current implementation includes light/dark theme configuration.
- Share links use `REACT_APP_PUBLIC_APP_URL` when configured.
- Authentication and toast notifications were not added in this pass.
- Existing legacy CSS files remain in the repo, but the active UI now uses Tailwind utility classes.

## Validation

- Static editor validation was run on the updated backend and frontend source files.
- The React development server was started from the actual app root: `No-Code-Form-master/No-Code-Form-master`.
- If you previously ran `npm start` from the parent folder, switch to the nested app root before running frontend commands.

## Next Steps

1. Run `npm install` in the root frontend folder.
2. Run `npm install` in `backend`.
3. Start MySQL locally and run `backend/schema.sql`.
4. Run backend with `npm run dev` in `backend`.
5. Run frontend with `npm start` in the project root.
