# Hackitt backend (simple MVC)

The backend uses Express routes, controllers, Mongoose models and MongoDB Atlas. Passwords are hashed and protected APIs use a JWT token.

## Run on your computer

1. Install Node.js LTS and MongoDB Atlas access.
2. In this `backend` folder, copy `.env.example` to `.env`.
3. Put your Atlas connection string in `MONGO_URI` and a long private value in `JWT_SECRET`.
4. Open a terminal in this folder and run `npm install`, then `npm run dev`.
5. Open `http://localhost:5000/api/health`. You should see `Hackitt API is working`.
6. Open the frontend through VS Code Live Server. The frontend API address is in `js/api.js`.

Never commit `.env` or send its contents in chat. The example file has placeholders only.

## API list

| Method | URL | Access | Body |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | — |
| POST | `/api/auth/signup` | Public | `firstName`, `lastName`, `email`, `password`, `role`, optional `skill` |
| POST | `/api/auth/login` | Public | `email`, `password` |
| GET | `/api/participants` | Organizer token | — |
| GET | `/api/teams` | Public | — |
| POST | `/api/teams/generate` | Organizer token | `teamSize` (2–10) |
| POST | `/api/teams/:id/join` | Student token | — |
| POST | `/api/team-change-requests` | Student token | `reason` |
| GET | `/api/team-change-requests/mine` | Student token | — |
| GET | `/api/team-change-requests` | Organizer token | — |
| PATCH | `/api/team-change-requests/:id` | Organizer token | `status`: `approved` or `rejected` |

Send the login/signup token in the `Authorization` header as `Bearer <token>`.
