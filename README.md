# visualization-view

Frontend for the visualization platform: browsing and editing chart data,
and a dashboard for the sensor devices reported by `visualization-device`.
Talks to `visualization-server`'s gateway.

## Setup

```bash
npm install
REACT_APP_API_BASE_URL=http://localhost:8080/api/content \
REACT_APP_USER_BASE_URL=http://localhost:8080/api/user \
REACT_APP_SENSORS_BASE_URL=http://localhost:8080/api/sensors \
REACT_APP_OAUTH_CLIENT_ID=dashboard-web \
npm start
```

`npm run build` outputs to `build/`.

## Routes

| Route | Auth |
|---|---|
| `/` | public — chart list |
| `/charts/:id` | public — chart detail |
| `/charts/new`, `/charts/:id/edit` | account |
| `/devices` | account — your sensor devices |
| `/devices/:id` | public — device readings and summary |
| `/login`, `/register` | public |

## Packages

`src/artifacts/*` is an npm workspaces monorepo:

| Package | Owns |
|---|---|
| `auth` | Login, session, protected routes |
| `dashboard` | Pages: charts, devices |
| `graphic` | Chart components (line, doughnut, bar) |
| `shared` | UI components |
| `api` | Fetch helpers |
