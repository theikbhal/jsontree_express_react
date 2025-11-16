🌲 jsontree Backend (Express + SQLite)

A lightweight JSON storage backend inspired by jsonbin.io, supporting:

JSON documents = trees

Grouping = forests

Full versioning per tree

Public/Private modes

API keys

User accounts & JWT login

This backend is built with Node.js + Express + SQLite.

📁 Project Structure
backend/
│
├─ src/
│  ├─ routes/
│  │  ├─ auth.js
│  │  ├─ apiKeys.js
│  │  ├─ trees.js
│  │  ├─ forests.js
│  │  └─ publicTrees.js
│  │
│  ├─ middleware/
│  │  ├─ auth.js
│  │  └─ apiKeyAuth.js
│  │
│  ├─ app.js
│  └─ server.js
│
├─ db/
│  └─ index.js      # SQLite initialization + schema
│
├─ data/
│  └─ jsontree.db   # SQLite database file
│
├─ .env
├─ package.json
└─ README.md

🛠️ Setup Instructions
1. Install dependencies
npm install

2. Create .env
JWT_SECRET=super-secret-key
JWT_EXPIRES_IN=7d
PORT=4000

3. Start the server
npm run dev


Backend runs at:

http://localhost:4000

🔑 Authentication Overview
Web login (email/password)
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me     (requires JWT token)


Frontend uses JWT.
API calls use X-API-Key, not JWT.

🔐 API Keys

To access private trees, updating, deleting, etc.
API key belongs to a user.

GET    /api/api-keys           (JWT required)
POST   /api/api-keys           (JWT required)
PATCH  /api/api-keys/:id       (JWT required)

🌳 Trees (JSON Documents)

All routes below require:

X-API-Key: jt_xxx


unless specified as public.

Create tree
POST /api/trees
Body:
{
  "name": "Title",
  "json_data": {...},
  "is_public": false,
  "forest_id": 1   // optional
}

List all trees of API user
GET /api/trees
GET /api/trees?forest_id=2

Get single tree (latest version)
GET /api/trees/:id

Update tree (partial)
PATCH /api/trees/:id
Body: any of
{
  "name": "...",
  "is_public": true/false,
  "forest_id": 1 or null,
  "json_data": {...}   // creates NEW VERSION
}

Delete tree
DELETE /api/trees/:id

🕓 Tree Versioning
List versions
GET /api/trees/:id/versions

Get specific version
GET /api/trees/:id/versions/:version

Delete specific version
DELETE /api/trees/:id/versions/:version


Rules:

Cannot delete last remaining version

If deleting current version → moves pointer to previous highest version

🌲🌲 Forests (Groups of Trees)

All require X-API-Key.

List forests
GET /api/forests

Create forest
POST /api/forests
Body: { "name": "Work" }

Rename forest
PATCH /api/forests/:id
Body: { "name": "Updated Name" }


A default forest "Untitled forest" is auto-created on signup.

🌐 Public Read API

These require NO AUTH.

Get public tree (latest version)
GET /api/public/trees/:id

Get public version list
GET /api/public/trees/:id/versions

Get specific public version
GET /api/public/trees/:id/versions/:version


Works only if:

is_public = 1

📌 Full API List (quick reference)
AUTH (JWT)
  POST   /api/auth/signup
  POST   /api/auth/login
  GET    /api/auth/me

API KEYS (JWT)
  GET    /api/api-keys
  POST   /api/api-keys
  PATCH  /api/api-keys/:id

TREES (X-API-Key)
  POST   /api/trees
  GET    /api/trees
  GET    /api/trees?forest_id=ID
  GET    /api/trees/:id
  PATCH  /api/trees/:id
  DELETE /api/trees/:id

VERSIONS (X-API-Key)
  GET    /api/trees/:id/versions
  GET    /api/trees/:id/versions/:version
  DELETE /api/trees/:id/versions/:version

FORESTS (X-API-Key)
  GET    /api/forests
  POST   /api/forests
  PATCH  /api/forests/:id

PUBLIC (no auth)
  GET    /api/public/trees/:id
  GET    /api/public/trees/:id/versions
  GET    /api/public/trees/:id/versions/:version

✔️ Backend Status
Feature	Status
Users auth + JWT	✅ Done
API key system	✅ Done
Trees CRUD	✅ Done
Versioning	✅ Done
Version delete	✅ Done
Forests CRUD	✅ Done
Trees-by-forest filter	✅ Done
Public read API	✅ Done
Fully working backend MVP	✅ COMPLETE