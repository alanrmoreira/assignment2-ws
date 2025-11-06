# Ignite Backend – API Server (TypeScript + Express + Prisma + MySQL)

A secure, modular backend built with **Node.js 22**, **TypeScript**, and **Express**, using **Prisma ORM** for MySQL, **JWT authentication**, **CSRF protection**, and **OpenAPI (Swagger)** for documentation.  
The project follows a layered architecture (controllers → services → repositories) with clean code conventions and environment-based configuration.

---

## Features

- **Authentication (JWT)** with short-lived tokens by default (`1h`)
- **CSRF protection** integrated with express-session
- **Session management** persisted in MySQL
- **Rate limiting**, **CORS**, and **Helmet** security middleware
- **Prisma ORM** for database access
- **Swagger / OpenAPI 3.0** auto-generated docs
- **Data migrations** via custom runner (`prisma/data-migrations`)
- Admin seeding for first-time setup
- **Long-TTL tokens (24h)** when using Swagger for testing

---

## Project Structure

```
ignite-backend
├── Dockerfile
├── README.md
├── docker-compose.yml
├── ecosystem.config.js
├── package-lock.json
├── package.json
├── prisma
│ ├── data-migrations
│ │ ├── 001_add_admin_role.ts
│ │ ├── 002_add_admin_user.ts
│ │ └── index.ts
│ ├── migrations
│ │ ├── 20251020052408_init
│ │ │ └── migration.sql
│ │ ├── 20251020053200_init
│ │ │ └── migration.sql
│ │ └── migration_lock.toml
│ └── schema.prisma
├── scripts
│ ├── ensure-db.ts
│ ├── kebab.sh
│ └── test_security.sh
├── src
│ ├── app.ts
│ ├── config
│ │ ├── db.ts
│ │ ├── env.ts
│ │ └── upload.ts
│ ├── controllers
│ │ ├── admin
│ │ │ ├── awards-controller.ts
│ │ │ ├── event-editions-controller.ts
│ │ │ ├── nominee-votes-controller.ts
│ │ │ ├── roles-controller.ts
│ │ │ ├── submission-votes-controller.ts
│ │ │ ├── users-controller.ts
│ │ │ └── users-in-event-controller.ts
│ │ └── public
│ │     ├── auth-controller.ts
│ │     ├── csrf-controller.ts
│ │     ├── edition-controller.ts
│ │     ├── nominee-votes-controller.ts
│ │     ├── nominees-controller.ts
│ │     ├── submissions-controller.ts
│ │     ├── submission-votes-controller.ts
│ │     └── submissions-controller.ts
│ ├── db
│ │ └── prisma.ts
│ ├── docs
│ │ └── openapi.ts
│ ├── enums
│ │ └── voting-window-enum.ts
│ ├── errors
│ │ └── app-error.ts
│ ├── logger.ts
│ ├── middlewares
│ │ ├── async-handler.ts
│ │ ├── auth-jwt.ts
│ │ ├── error-handler.ts
│ │ └── require-csrf.ts
│ ├── repositories
│ │ ├── auth-repo.ts
│ │ ├── awards-repo.ts
│ │ ├── event-editions-repo.ts
│ │ ├── nominee-votes-repo.ts
│ │ ├── nominees-repo.ts
│ │ ├── roles-repo.ts
│ │ ├── submission-votes-repo.ts
│ │ ├── submissions-read-repo.ts
│ │ ├── submissions-repo.ts
│ │ ├── users-in-event-repo.ts
│ │ └── users-repo.ts
│ ├── routes
│ │ ├── admin
│ │ │ ├── awards-routes.ts
│ │ │ ├── event-editions-routes.ts
│ │ │ ├── roles-routes.ts
│ │ │ ├── submission-votes-routes.ts
│ │ │ ├── submissions-routes.ts
│ │ │ ├── users-routes.ts
│ │ │ └── votes-routes.ts
│ │ ├── index.ts
│ │ └── public
│ │     ├── auth-routes.ts
│ │     ├── csrf-routes.ts
│ │     ├── docs-routes.ts
│ │     ├── edition-routes.ts
│ │     ├── health-check-routes.ts
│ │     ├── health-routes.ts
│ │     ├── nominations-routes.ts
│ │     ├── nominee-votes-routes.ts
│ │     ├── submissions-routes.ts
│ │     ├── submissions-votes-routes.ts
│ │     └── ready-routes.ts
│ ├── security
│ │ ├── captcha.ts
│ │ ├── cors.ts
│ │ ├── csrf.ts
│ │ ├── jwt.ts
│ │ └── rate-llimit.ts
│ ├── server.ts
│ ├── services
│ │ ├── auth-service.ts
│ │ ├── awards-service.ts
│ │ ├── csrf-service.ts
│ │ ├── email-service.ts
│ │ ├── event-editions-service.ts
│ │ ├── nominee-votes-service.ts
│ │ ├── nominees-service.ts
│ │ ├── roles-service.ts
│ │ ├── submission-votes-service.ts
│ │ ├── submissions-service.ts
│ │ └── users-service.ts
│ ├── types
│ │ ├── auth-dto.ts
│ │ ├── express-mysql-session-d.ts
│ │ ├── roles-dto.ts
│ │ ├── session-d.ts
│ │ ├── submission-dto.ts
│ │ ├── swagger-jsdoc-d.ts
│ │ └── users-dto.ts
│ └── utils
│     ├── file-lurl.ts
│     ├── parse-users-csv.ts
│     └── swagger-detect.ts
├── tsconfig.json
└── uploads
    └── submissions
        
```
---

## Authentication & CSRF

### JWT
- Default expiration: `1h`
- When the request comes from **Swagger UI**, expiration is extended to **24h**
- Uses `issuer: ignite-backend`

### CSRF
- Session-bound, random 24-byte hex tokens
- Valid for **30 minutes** by default, or **24h** when used from Swagger

---

## Data Migrations

Data migrations are run automatically before startup.

#### `001_add_admin_role.ts`
Creates the role `"admin"` if missing.

#### `002_add_admin_user.ts`
Creates the default administrator:

| Field | Value |
|-------|--------|
| **Name** | Ignite Admin |
| **Email** | ignite_admin@interactivedesign.ca |
| **Password (bcrypt)** | stringst |
| **Role** | admin |

---

## Scripts

| Command | Description |
|----------|--------------|
| `npm run dev` | Run development server |
| `npm run build` | Compile TypeScript |
| `npm start` | Run built server |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run db:deploy` | Apply migrations |
| `npm run db:data-migrate` | Run data migrations |

---

## Swagger Documentation

- URL: [http://localhost:80/docs](http://localhost:80/docs)
- Requires active session (cookie)
- Grants long-lived tokens (24h) for QA testing
- Disabled automatically in production

---

## Docker & Containerization

This project includes a full **Dockerized setup** for development and deployment.

### **Local Development**

```bash
docker compose up -d --build
```

This will:
- Build the `ignite-backend` image using the provided **Dockerfile**
- Start both the **API container** and a **MySQL container**
- Automatically run Prisma migrations and data seeders

Access the app at:  
* http://localhost:80

Swagger docs:  
* http://localhost:80/docs

---

### **Production Build Example**

To build and run the app in production mode:

```bash
docker build -t ignite-backend:prod .
docker run -d -p 80:80 --name ignite-backend ignite-backend:prod
```

---

### **Logs and Access**

View container logs:
```bash
docker logs -f ignite-backend
```

Access MySQL inside container:
```bash
docker exec -it ignite-mysql mysql -uroot -proot_pwd ignite
```


## Deployment Notes

For cPanel or manual deployment:

```bash
npm ci
npm run build
npm run db:deploy
npm run db:data-migrate
npm start
```

---

## Default Admin Credentials

| Field | Value |
|--------|--|
| Email | ignite_admin@interactivedesign.ca |
| Password | stringst |
| Role | admin |

---

## DB Design

<img width="1256" height="823" alt="image" src="https://github.com/user-attachments/assets/d98fac0f-d0e2-4717-b50f-8eb3ed34307c" />

```dbml
Table sessions {
  session_id varchar(128) [pk]
  expires int
  data text
}

Table Role {
  id int [pk, increment]
  role_name varchar(50)
}

Table User {
  id int [pk, increment]
  name varchar(120)
  email varchar(255) [unique]
  password varchar(255)
  role_id int
  created_at datetime
  updated_at datetime
}

Table EventEdition {
  id int [pk, increment]
  year int
  submissions_start datetime
  submissions_end datetime
  votes_start datetime
  votes_end datetime
}

Table UsersInEvent {
  id int [pk, increment]
  event_edition_id int
  user_name varchar(120)
  user_email varchar(255)
  user_sait_id varchar(64)
  user_permission varchar(20)
  created_at datetime
}

Table Award {
  id int [pk, increment]
  event_edition_id int
  category_name varchar(120)
}

Table Nominee {
  id int [pk, increment]
  user_in_event_id int
  award_id int
  nominator_user_in_event_id int
  created_at datetime
}

Table Submission {
  id int [pk, increment]
  award_id int
  user_in_event_id int
  is_group_submission boolean
  contact_name varchar(120)
  contact_email varchar(255)
  project_title varchar(200)
  project_description text
  project_cover_image varchar(500)
  project_url varchar(500)
  status varchar(20)
  reviewed_by_user_id int
  reviewed_at datetime
  review_note text
  winner boolean
  submission_date datetime
}

Table SubmissionMember {
  id int [pk, increment]
  submission_id int
  user_in_event_id int
}

Table SubmissionFile {
  id int [pk, increment]
  submission_id int
  storage_key varchar(500)
  original_name varchar(255)
  mime_type varchar(150)
  size_bytes int
  uploaded_by_user_in_event_id int
}

Table NomineeVote {
  id bigint [pk, increment]
  nominee_id int
  voter_user_in_event_id int
  vote_date datetime
}

Table SubmissionVote {
  id bigint [pk, increment]
  submission_id int
  voter_user_in_event_id int
  vote_date datetime
}

Table _data_migrations {
  id int [pk, increment]
  key varchar(191) [unique]
  applied_at datetime
}

Ref: User.role_id > Role.id

Ref: UsersInEvent.event_edition_id > EventEdition.id

Ref: Award.event_edition_id > EventEdition.id

Ref: Nominee.user_in_event_id > UsersInEvent.id
Ref: Nominee.award_id > Award.id
Ref: Nominee.nominator_user_in_event_id > UsersInEvent.id

Ref: Submission.award_id > Award.id
Ref: Submission.user_in_event_id > UsersInEvent.id
Ref: Submission.reviewed_by_user_id > UsersInEvent.id

Ref: SubmissionMember.submission_id > Submission.id
Ref: SubmissionMember.user_in_event_id > UsersInEvent.id

Ref: SubmissionFile.submission_id > Submission.id
Ref: SubmissionFile.uploaded_by_user_in_event_id > UsersInEvent.id

Ref: NomineeVote.nominee_id > Nominee.id
Ref: NomineeVote.voter_user_in_event_id > UsersInEvent.id

Ref: SubmissionVote.submission_id > Submission.id
Ref: SubmissionVote.voter_user_in_event_id > UsersInEvent.id



Ref: "Submission"."id" < "Submission"."user_in_event_id"
