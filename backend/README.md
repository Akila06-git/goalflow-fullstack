# GoalFlow — Real-Time Goal Tracking App

## Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite (responsive — mobile, tablet, desktop) |
| Backend | Java 17 + Spring Boot 3.2 |
| Database | MySQL 8 |
| Real-Time | WebSocket (STOMP over SockJS) |
| Auth | JWT (Bearer token) |

---

## Project Structure

```
goalflow/
├── frontend/                   ← React Vite app
│   ├── src/
│   │   ├── GoalFlow.jsx        ← Main app component
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
└── backend/                    ← Spring Boot app
    ├── pom.xml
    └── src/main/
        ├── java/com/goalflow/
        │   ├── GoalFlowApplication.java
        │   ├── model/          User, Goal, Task
        │   ├── repository/     JPA repositories
        │   ├── service/        UserService, GoalService, TaskService
        │   ├── controller/     AuthController, GoalController, TaskController
        │   ├── security/       JwtUtil, JwtAuthFilter, SecurityConfig
        │   ├── websocket/      WebSocketConfig, RealTimePublisher
        │   └── dto/            Request/Response DTOs
        └── resources/
            ├── application.yml
            └── schema.sql
```

---

## Quick Start

### 1. MySQL Setup

```sql
-- Create the database and run the schema
mysql -u root -p < src/main/resources/schema.sql
```

Demo accounts are created automatically:
- `akila@demo.com` / `demo123`
- `rahul@demo.com` / `demo123`

### 2. Backend (Spring Boot)

```bash
cd backend/

# Edit src/main/resources/application.yml
# Change: spring.datasource.password: your_mysql_password

# First run — create tables
# Change ddl-auto to 'create', sql.init.mode to 'always'
# Then revert to 'validate' and 'never'

mvn spring-boot:run
# Backend starts on http://localhost:8080
```

### 3. Frontend (React + Vite)

```bash
cd frontend/
npm install
npm run dev
# App opens at http://localhost:5173
```

---

## REST API

All protected endpoints require: `Authorization: Bearer <token>`

### Auth
| Method | URL | Body | Description |
|--------|-----|------|-------------|
| POST | `/api/auth/login` | `{email, password}` | Sign in → returns JWT |
| POST | `/api/auth/register` | `{name, email, password}` | Create account |

### Goals
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/goals` | Get user's goals |
| POST | `/api/goals` | Create goal `{title, category, icon, deadline}` |
| PUT | `/api/goals/{id}` | Update goal |
| PATCH | `/api/goals/{id}/progress` | Update progress `{progress: 0-100}` |
| DELETE | `/api/goals/{id}` | Delete goal |

### Tasks
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/tasks` | All user tasks |
| GET | `/api/tasks/today` | Today's tasks only |
| POST | `/api/tasks` | Create task `{text, goalId?}` |
| PATCH | `/api/tasks/{id}/toggle` | Toggle done/undone |
| DELETE | `/api/tasks/{id}` | Delete task |

---

## Real-Time (WebSocket)

The frontend connects via SockJS + STOMP:

```javascript
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const client = new Client({
  webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
  onConnect: () => {
    // Subscribe to your goal updates
    client.subscribe(`/topic/goals/${userId}`, (msg) => {
      const event = JSON.parse(msg.body);
      // event.type: GOAL_ADDED | GOAL_UPDATED | GOAL_DELETED | TASK_UPDATED
      // event.payload: the changed object
    });
    // Subscribe to global activity feed
    client.subscribe('/topic/activity', (msg) => {
      console.log('Activity:', JSON.parse(msg.body).payload);
    });
  }
});
client.activate();
```

Events pushed by backend:
- `GOAL_ADDED` — new goal created
- `GOAL_UPDATED` — goal title/progress/category changed
- `GOAL_DELETED` — goal removed
- `TASK_ADDED` — new task
- `TASK_UPDATED` — task toggled (done/undone)
- `TASK_DELETED` — task removed
- `ACTIVITY` — public feed (completions, streaks, milestones)

---

## Connecting Frontend to Backend

Replace the simulated API in `GoalFlow.jsx` with real fetch calls:

```javascript
const BASE = 'http://localhost:8080/api';
let token = localStorage.getItem('goalflow_token');

const api = {
  login: async (email, password) => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Invalid credentials');
    const data = await res.json();
    token = data.token;
    localStorage.setItem('goalflow_token', token);
    return data;
  },
  getGoals: async () => {
    const res = await fetch(`${BASE}/goals`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },
  addGoal: async (goal) => {
    const res = await fetch(`${BASE}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(goal)
    });
    return res.json();
  },
  updateProgress: async (goalId, progress) => {
    const res = await fetch(`${BASE}/goals/${goalId}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ progress })
    });
    return res.json();
  },
  // ... similarly for other endpoints
};
```

---

## Responsive Design

The app works on all devices:
- **Mobile** (< 640px): bottom navigation, full-width cards, thumb-friendly buttons
- **Tablet** (640–1024px): wider cards, more breathing room
- **Desktop** (> 1024px): centered max-width 520px layout (app-style) or expand to dashboard

---

## Production Checklist

- [ ] Change `goalflow.jwt.secret` to a random 256-bit key
- [ ] Set `spring.datasource.password` via env var, not plain text
- [ ] Change `ddl-auto` to `validate`
- [ ] Restrict CORS to your frontend domain
- [ ] Enable HTTPS (SSL)
- [ ] Set up database connection pooling (HikariCP already configured)
- [ ] Deploy backend to EC2/Render/Railway; frontend to Vercel/Netlify
