# No-Code Form Studio

Full-stack no-code form builder built with React, Express, Node.js, MySQL-compatible storage, and Tailwind CSS.

The project includes:

- an admin workspace for creating and editing forms
- dynamic field creation with drag-and-drop support
- public form links for respondents
- response collection and review
- lightweight analytics
- theme customization per form
- production-ready environment configuration
- support for local MySQL or hosted TiDB Cloud

## Stack

- Frontend: React 19, React Router, Tailwind CSS, React DnD
- Backend: Express 4, Node.js, mysql2
- Database: MySQL-compatible database such as MySQL or TiDB Cloud
- Deployment: local development, same-domain production, split frontend/backend, Render backend hosting

## Main Features

### Admin builder

- create a new blank form
- open any saved form from the `All Forms` section
- edit form name and description
- add fields from a field library
- reorder fields with drag-and-drop or move buttons
- edit field settings such as label, placeholder, required, options, width, and alignment
- duplicate or delete the active form
- save forms and generate public share links

### Supported field types

- text
- textarea
- select
- radio
- checkbox
- date

### Theme Studio

- light or dark mode
- primary color
- background color
- text color
- font family

Theme settings are saved with the form and applied in the public form renderer.

### Responses and analytics

- review submissions for the active form
- reload responses on demand
- export responses as CSV
- see response count and latest submission time

## Routes

### Frontend routes

- `/`
- `/admin`
- `/admin/forms`
- `/form/:formId`
- `/forms/:formId`

### Backend routes

- `GET /api/health`
- `GET /api/forms`
- `GET /api/forms/:id`
- `POST /api/forms`
- `PUT /api/forms/:id`
- `DELETE /api/forms/:id`
- `POST /api/responses`
- `GET /api/responses/:formId`

## Project Structure

```text
No-Code-Form-master/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── scripts/
│   ├── utils/
│   ├── .env.example
│   ├── db.js
│   ├── package.json
│   └── server.js
├── build/
├── public/
├── src/
│   ├── components/
│   ├── context/
│   ├── lib/
│   ├── pages/
│   ├── api.js
│   ├── App.js
│   ├── index.css
│   └── index.js
├── .env.example
├── package.json
└── README.md
```

## Environment Files

### Frontend `.env`

Create `.env` in the project root from `.env.example`.

```env
REACT_APP_PUBLIC_APP_URL=http://localhost:3000
REACT_APP_API_BASE_URL=
```

- `REACT_APP_PUBLIC_APP_URL`: base URL used to generate the public share link shown in admin
- `REACT_APP_API_BASE_URL`: optional full backend API URL such as `https://api.yourdomain.com/api`
- leave `REACT_APP_API_BASE_URL` empty when frontend and backend run on the same domain

### Backend `.env`

Create `backend/.env` from `backend/.env.example`.

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

- `CLIENT_ORIGIN`: allowed frontend origin, supports a comma-separated list
- `MYSQL_SSL=true`: required for hosted databases like TiDB Cloud
- `MYSQL_SSL_CA` or `MYSQL_SSL_CA_PATH`: optional CA certificate content or path
- `NODE_ENV=production`: enables static serving of the built frontend from Express when `build/` exists

## Database Schema

The current backend expects these tables.

### `forms`

- `id` INT AUTO_INCREMENT PRIMARY KEY
- `title` VARCHAR(255) NOT NULL
- `description` TEXT
- `theme_json` LONGTEXT NULL
- `is_active` TINYINT(1) DEFAULT 1
- `created_at` TIMESTAMP
- `updated_at` TIMESTAMP

### `fields`

- `id` INT AUTO_INCREMENT PRIMARY KEY
- `form_id` INT NOT NULL
- `label` VARCHAR(255) NOT NULL
- `type` VARCHAR(50) NOT NULL
- `placeholder` VARCHAR(255) NULL
- `is_required` TINYINT(1) DEFAULT 0
- `sort_order` INT DEFAULT 0
- `options` LONGTEXT NULL
- `validation_rules` LONGTEXT NULL

### `responses`

- `id` INT AUTO_INCREMENT PRIMARY KEY
- `form_id` INT NOT NULL
- `answers` LONGTEXT NOT NULL
- `respondent_email` VARCHAR(255) NULL
- `submitted_at` TIMESTAMP

## Local Development

### 1. Install dependencies

Frontend:

```bash
npm install
```

Backend:

```bash
cd backend
npm install
```

### 2. Configure env files

- create `.env` in the project root
- create `backend/.env` in `backend`

### 3. Initialize the database

Use the current runtime schema initializer instead of relying on the older `backend/schema.sql` file.

```bash
cd backend
npm run setup:db
```

This command creates:

- the `dynamic_form_builder` database if it does not exist
- the `forms`, `fields`, and `responses` tables
- supporting indexes

### 4. Start the backend

```bash
cd backend
npm run dev
```

Backend health check:

```text
http://localhost:5000/api/health
```

### 5. Start the frontend

From the project root:

```bash
npm start
```

Admin URL:

```text
http://localhost:3000/admin/forms
```

The frontend uses the `proxy` in `package.json` during local development, so local API requests go to `http://localhost:5000` when `REACT_APP_API_BASE_URL` is empty.

## How To Use The App

### Admin flow

1. Open `/admin/forms`
2. Click `+ New Form` or open an existing form from `All Forms`
3. Enter the form name and description
4. Add fields from the field library
5. Select a field and edit its configuration in the field editor
6. Adjust visual settings in `Theme Studio`
7. Click `Save`
8. Use `Preview` or copy the public share link
9. Review submissions in `Responses`
10. Check basic form metrics in `Analytics`

### Public flow

1. Open the public link `/form/:formId`
2. Fill out the generated form
3. Submit the response
4. See the response appear in admin

## Production Notes

### Same-domain deployment

Use this when Express serves the frontend build.

Frontend `.env`:

```env
REACT_APP_PUBLIC_APP_URL=https://forms.yourdomain.com
REACT_APP_API_BASE_URL=
```

Backend `.env`:

```env
CLIENT_ORIGIN=https://forms.yourdomain.com
NODE_ENV=production
```

Build and start:

```bash
npm run build
cd backend
npm start
```

### Split frontend/backend deployment

Use this when frontend and backend are deployed on different domains.

Frontend `.env`:

```env
REACT_APP_PUBLIC_APP_URL=https://forms.yourdomain.com
REACT_APP_API_BASE_URL=https://api.yourdomain.com/api
```

Backend `.env`:

```env
CLIENT_ORIGIN=https://forms.yourdomain.com
NODE_ENV=production
```

## TiDB Cloud

TiDB Cloud works because the backend uses `mysql2` and supports TLS.

Example `backend/.env` for TiDB Cloud:

```env
PORT=5000
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
NODE_ENV=production
```

TiDB setup flow:

1. create the TiDB Cloud cluster or serverless instance
2. add your backend server IP to the TiDB allowlist if required
3. set the TiDB connection values in `backend/.env`
4. run `npm run setup:db` in `backend`
5. start the backend

## Deploy Backend On Render

For a manual Render backend deploy:

- Service Type: Web Service
- Root Directory: `backend`
- Build Command: `npm run build`
- Start Command: `npm start`
- Health Check Path: `/api/health`

The backend does not require a compile step. The `build` script exists so Render services configured with `npm run build` succeed consistently.

Recommended Render environment variables:

```env
NODE_ENV=production
CLIENT_ORIGIN=https://forms.yourdomain.com
MYSQL_HOST=your_tidb_host
MYSQL_PORT=4000
MYSQL_USER=your_tidb_user
MYSQL_PASSWORD=your_tidb_password
MYSQL_DATABASE=dynamic_form_builder
MYSQL_SSL=true
MYSQL_SSL_REJECT_UNAUTHORIZED=true
MYSQL_SSL_CA=
MYSQL_SSL_CA_PATH=
```

After deploy:

1. open `/api/health` on the Render service
2. confirm Render can reach TiDB Cloud
3. set the frontend `REACT_APP_API_BASE_URL` to the Render backend URL

## Available Scripts

### Frontend

- `npm start`
- `npm run build`
- `npm test`

### Backend

- `npm start`
- `npm run dev`
- `npm run setup:db`

## Important Notes

- Public share links use `REACT_APP_PUBLIC_APP_URL` when configured.
- Theme settings are stored in the database and applied in the public form renderer.
- `backend/schema.sql` exists in the repo, but the current recommended initializer is `npm run setup:db` because it matches the runtime controllers.
- The active UI is Tailwind-based; some older files remain in the repo but are not the primary styling path.
