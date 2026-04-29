# EduControl

Classroom management system inspired by NetSupport School.

## Run Backend

```bash
cd backend
pip install fastapi uvicorn websockets pydantic
uvicorn main:app --reload --port 8000
```

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

## Login Credentials

| Role    | Email              | Password     |
|---------|--------------------|--------------|
| Tutor   | tutor@edu.com      | password123  |
| Admin   | admin@edu.com      | password123  |
| Student | student1@edu.com   | password123  |

## Features

- **Tutor Dashboard**: 3-column layout with student sidebar, action bar (blank/lock/broadcast/block internet), student grid with live status, bottom tabs (chat/quiz/log), and right slide-over for individual student control
- **Student View**: Receives tutor commands (blank screen, lock input, broadcast messages), quiz panel, chat with tutor
- **Admin Panel**: Stats overview, student/class management, session log
- **Real-time**: WebSocket-based status updates every 15 seconds, live chat, quiz results
