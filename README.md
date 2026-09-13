# IDEC Logistics Daily Truck Job Management

Production-oriented daily truck job management for authorized company staff. The **Expo SDK 54** app lives in `IDEC/` (existing project, not regenerated). The REST API lives in `backend/`.

## Architecture

```
IDEC (React Native / Expo Router)
        |
        | HTTPS / REST  Authorization: Bearer <JWT>
        |
backend (Node.js + Express + TypeScript)
        |
        | Mongoose
        |
MongoDB (local or Atlas)
```

Layered backend: `config`, `controllers`, `middleware`, `models`, `routes`, `services`, `validators`, `utils`, `types`.

**Daily lock is enforced on the API.** The mobile app hides Add/Edit/Delete/Finalize controls for finalized dates, but `POST/PUT/DELETE /api/jobs` independently check `DailyJobControl.status`. A finalized day cannot be reopened through normal app functionality.

### Business date handling

Job and control dates are stored as `YYYY-MM-DD` calendar dates, not UTC timestamps. “Today” is computed in `APP_TIMEZONE` (default `Asia/Colombo`). Do not use `toISOString()` for business dates.

### Role permissions

| Action | ADMIN | MANAGER | OPERATOR | VIEWER |
| --- | --- | --- | --- | --- |
| View jobs / history | yes | yes | yes | yes |
| Create / update jobs (open days) | yes | yes | yes | no |
| Delete jobs | yes | no | no | no |
| Finalize a day | yes | yes | no | no |
| Manage vehicles | yes | view | no | no |
| Manage users | yes | no | no | no |

Zero-job days can still be finalized.

### API envelope

Success:

```json
{ "success": true, "data": {}, "message": "Job created successfully" }
```

Login token is in `data.token` (consistent envelope; not a separate top-level `token` field).

Finalized mutation error: HTTP 403, `errorCode: "DAY_FINALIZED"`.

## Requirements

- Node.js 20+
- npm
- MongoDB locally **or** MongoDB Atlas
- Expo CLI (via `npx expo`)
- Android Studio emulator and/or a physical Android/iOS device
- Git

## Backend

```bash
cd backend
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
npm install
npm run seed
npm run dev
```

API: `http://localhost:5000`  
Health: `GET /health`  
REST prefix: `/api`

### Environment (`backend/.env`)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/logistics_app
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=1d
APP_TIMEZONE=Asia/Colombo
NODE_ENV=development
CORS_ORIGIN=*
```

**MongoDB Atlas:** set `MONGODB_URI` to your Atlas connection string (include the database name). Keep `.env` out of Git.

### Seed users (development only)

`npm run seed` creates:

| Username | Password | Role |
| --- | --- | --- |
| admin | Admin@123 | ADMIN |
| manager | Manager@123 | MANAGER |
| operator | Operator@123 | OPERATOR |
| viewer | Viewer@123 | VIEWER |

Vehicles: `JR-8000` (20"), `LJ-0980` (40"), and the remaining lorries as Other lorry.

These passwords are **development-only**. Change or remove them before production.

### Tests

```bash
cd backend
npm test
```

Covers login, job CRUD validation, role authorization, and create/update/delete after finalization (403).

## Mobile app (`IDEC/`)

```bash
cd IDEC
copy .env.example .env
npm install
npx expo start
```

Then press `a` for Android emulator, `i` for iOS simulator, or scan the QR code with Expo Go.

### Environment (`IDEC/.env`)

```
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:5000/api
EXPO_PUBLIC_APP_TIMEZONE=Asia/Colombo
```

**Do not use `localhost` from a physical phone.** The phone cannot reach your PC at `localhost`.

1. On Windows: `ipconfig` → IPv4 address, e.g. `192.168.1.23`
2. Set `EXPO_PUBLIC_API_URL=http://192.168.1.23:5000/api`
3. Phone and PC must be on the same Wi-Fi
4. Allow port 5000 through Windows Firewall if needed
5. Restart Expo after changing `.env`

Emulator notes:

- Android emulator can use `http://10.0.2.2:5000/api` to reach the host machine
- iOS simulator can use `http://127.0.0.1:5000/api`

JWT is stored in **Expo SecureStore** on iOS/Android (web uses `localStorage` only as a fallback). Axios attaches `Authorization: Bearer <token>`. A `401` clears the token and returns to Login.

### Production builds

```bash
cd IDEC
npx expo prebuild
npx expo run:android
# or EAS
npx eas build -p android
npx eas build -p ios
```

Set production `EXPO_PUBLIC_API_URL` to your HTTPS API. Never ship seed passwords or a weak `JWT_SECRET`.

## Future extension

Services and models are isolated so destination masters, drivers, trips, audit logs, and reports can be added without rewriting auth, jobs, or daily lock. A recommended future `AuditLog` collection: `userId`, `action`, `entityType`, `entityId`, `oldValue`, `newValue`, `timestamp`.
