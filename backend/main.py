import asyncio
import random
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Mock Data ---

USERS = {
    "tutor@edu.com": {"password": "password123", "role": "tutor", "name": "Prof. Anderson", "id": "tutor-1"},
    "admin@edu.com": {"password": "password123", "role": "admin", "name": "Admin User", "id": "admin-1"},
}
for i in range(1, 11):
    USERS[f"student{i}@edu.com"] = {
        "password": "password123",
        "role": "student",
        "name": f"Student {i}",
        "id": f"student-{i}",
    }

STUDENTS = [
    {"id": f"student-{i}", "name": f"Student {i}", "email": f"student{i}@edu.com",
     "class": random.choice(["CS101", "Math202", "Physics301"]),
     "status": random.choice(["online", "idle", "offline"])}
    for i in range(1, 11)
]

CLASSES = ["CS101", "Math202", "Physics301"]

QUIZ_DATA: dict = {"questions": []}
QUIZ_ANSWERS: dict = {}  # student_id -> answers

SESSION_LOG: list[dict] = []

# --- WebSocket Connections ---

tutor_ws: Optional[WebSocket] = None
student_ws_connections: dict[str, WebSocket] = {}


# --- Models ---

class LoginRequest(BaseModel):
    email: str
    password: str


class CommandRequest(BaseModel):
    type: str
    target: str = "all"
    payload: dict = {}


class QuizQuestion(BaseModel):
    text: str
    options: list[str]


class QuizRequest(BaseModel):
    questions: list[QuizQuestion]


class QuizAnswerRequest(BaseModel):
    student_id: str
    answers: list[str]


# --- REST Endpoints ---

@app.post("/api/login")
def login(req: LoginRequest):
    user = USERS.get(req.email)
    if not user or user["password"] != req.password:
        return {"error": "Invalid credentials"}
    return {"token": "fake-jwt", "role": user["role"], "name": user["name"], "id": user["id"]}


@app.get("/api/students")
def get_students():
    return STUDENTS


@app.get("/api/classes")
def get_classes():
    return CLASSES


@app.post("/api/command")
async def send_command(req: CommandRequest):
    log_entry = {
        "time": datetime.now().strftime("%H:%M:%S"),
        "action": req.type,
        "target": req.target,
    }
    SESSION_LOG.append(log_entry)

    message = {"type": req.type, "payload": req.payload}

    if req.target == "all":
        for sid, ws in student_ws_connections.items():
            try:
                await ws.send_json(message)
            except Exception:
                pass
    else:
        ws = student_ws_connections.get(req.target)
        if ws:
            try:
                await ws.send_json(message)
            except Exception:
                pass

    if tutor_ws:
        try:
            await tutor_ws.send_json({"type": "COMMAND_LOG", "payload": log_entry})
        except Exception:
            pass

    return {"status": "ok"}


@app.post("/api/quiz")
def create_quiz(req: QuizRequest):
    global QUIZ_DATA, QUIZ_ANSWERS
    QUIZ_DATA = {"questions": [{"text": q.text, "options": q.options} for q in req.questions]}
    QUIZ_ANSWERS = {}
    return {"status": "ok"}


@app.get("/api/quiz")
def get_quiz():
    return QUIZ_DATA


@app.post("/api/quiz/answer")
def submit_answer(req: QuizAnswerRequest):
    QUIZ_ANSWERS[req.student_id] = req.answers
    return {"status": "ok"}


@app.get("/api/quiz/results")
def quiz_results():
    if not QUIZ_DATA.get("questions"):
        return {"questions": []}
    result = []
    for i, q in enumerate(QUIZ_DATA["questions"]):
        counts: dict[str, int] = {}
        for opt in q["options"]:
            counts[opt] = 0
        for answers in QUIZ_ANSWERS.values():
            if i < len(answers):
                ans = answers[i]
                if ans in counts:
                    counts[ans] += 1
        result.append({"question": q["text"], "counts": counts})
    return {"questions": result}


@app.get("/api/session-log")
def get_session_log():
    return SESSION_LOG


# --- WebSocket Endpoints ---

@app.websocket("/ws/tutor")
async def ws_tutor(websocket: WebSocket):
    global tutor_ws
    await websocket.accept()
    tutor_ws = websocket
    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")
            payload = data.get("payload", {})
            target = data.get("target", "all")

            if msg_type == "CHAT":
                chat_msg = {"type": "CHAT", "payload": {"from": "Tutor", "text": payload.get("text", ""), "time": datetime.now().strftime("%H:%M:%S")}}
                if target == "all":
                    for sid, ws in student_ws_connections.items():
                        try:
                            await ws.send_json(chat_msg)
                        except Exception:
                            pass
                else:
                    ws = student_ws_connections.get(target)
                    if ws:
                        try:
                            await ws.send_json(chat_msg)
                        except Exception:
                            pass

    except WebSocketDisconnect:
        tutor_ws = None


@app.websocket("/ws/student/{student_id}")
async def ws_student(websocket: WebSocket, student_id: str):
    await websocket.accept()
    student_ws_connections[student_id] = websocket

    for s in STUDENTS:
        if s["id"] == student_id:
            s["status"] = "online"
            break

    if tutor_ws:
        try:
            await tutor_ws.send_json({"type": "STUDENT_JOIN", "payload": {"id": student_id, "status": "online"}})
        except Exception:
            pass

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")
            payload = data.get("payload", {})

            if msg_type == "CHAT":
                if tutor_ws:
                    try:
                        await tutor_ws.send_json({"type": "CHAT", "payload": {"from": student_id, "text": payload.get("text", ""), "time": datetime.now().strftime("%H:%M:%S")}})
                    except Exception:
                        pass

            elif msg_type == "QUIZ_ANSWER":
                answers = payload.get("answers", [])
                QUIZ_ANSWERS[student_id] = answers
                if tutor_ws:
                    try:
                        await tutor_ws.send_json({"type": "QUIZ_ANSWER", "payload": {"student_id": student_id}})
                    except Exception:
                        pass

    except WebSocketDisconnect:
        student_ws_connections.pop(student_id, None)
        for s in STUDENTS:
            if s["id"] == student_id:
                s["status"] = "offline"
                break
        if tutor_ws:
            try:
                await tutor_ws.send_json({"type": "STATUS_UPDATE", "payload": {"id": student_id, "status": "offline"}})
            except Exception:
                pass


# --- Background Task: Random Status Updates ---

async def random_status_updates():
    while True:
        await asyncio.sleep(15)
        indices = random.sample(range(len(STUDENTS)), min(3, len(STUDENTS)))
        updates = []
        for idx in indices:
            new_status = random.choice(["online", "idle", "offline"])
            STUDENTS[idx]["status"] = new_status
            updates.append({"id": STUDENTS[idx]["id"], "status": new_status})
        if tutor_ws:
            try:
                await tutor_ws.send_json({"type": "STATUS_UPDATE", "payload": {"updates": updates}})
            except Exception:
                pass


@app.on_event("startup")
async def startup():
    asyncio.create_task(random_status_updates())
