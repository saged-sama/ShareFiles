from fastapi import FastAPI, WebSocket, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict
import sqlite3
import uuid

app = FastAPI()

conn = sqlite3.connect('config.db')
cursor = conn.cursor()

cursor.execute('''CREATE TABLE IF NOT EXISTS configs(
                    id TEXT PRIMARY KEY,
                    username TEXT UNIQUE,
                    avatar TEXT,
                    publicKey TEXT,
                    lastActive TIMESTAMP DEFAULT CURRENT_TIMESTAMP
               )'''
            )

origins = [
    "http://localhost:5173",
    "http://192.168.0.199:5173/"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Config(BaseModel):
    id: str = None
    username: str
    avatar: str
    publicKey: str

connections: Dict[str, WebSocket] = {};

@app.websocket("/ws/connect/{peerId}")
async def connect_websocket(websocket: WebSocket, peerId: str):
    await websocket.accept()
    connections[peerId] = websocket
    try:
        while True:
            data = await websocket.receive_text()
    except:
        connections.pop(peerId)

class Approval(BaseModel):
    message: str
    senderId: str
    id: str

@app.post("/approval")
async def approve_connection(data: Approval):
    if data.senderId in connections:
        await connections[data.senderId].send_json({
            "message": data.message,
            "id": data.id
        })
    return {"status": "success"}

class Check(BaseModel):
    filename: str
    filesize: int

@app.post("/check/{channelId}")
async def check_availability(channelId: str, check: Check):
    sender, receiver = channelId.split("---")
    
    if receiver in connections:
        data = {
            "filename": check.filename,
            "filesize": check.filesize,
            "sender": sender,
            "receiver": receiver
        }
        await connections[receiver].send_json(data)
    return {"status": "success"}

@app.post("/share/{channelId}")
async def share_config(channelId: str, 
        filename: str = Form(...),
        filesize: float = Form(...),
        totalChunks: int = Form(...),
        chunkNo: int = Form(...),
        encryptedData: str = Form(...),
        encryptedAesKey: str = Form(...),
        iv: str = Form(...)
    ):
    sender, receiver = channelId.split("---")
    data = {
        "sender": sender,
        "filename": filename,
        "filesize": filesize,
        "totalChunks": totalChunks,
        "chunkNo": chunkNo,
        "encryptedData": encryptedData,
        "encryptedAesKey": encryptedAesKey,
        "iv": iv
    }
    if receiver not in connections:
        return {"status": "failed"}
    await connections[receiver].send_json(data)
    return {"status": "success"}

@app.post("/config")
async def create_config(data: Config):
    data.id = str(uuid.uuid4())
    cursor.execute('INSERT INTO configs(id, username, avatar, publicKey) VALUES(?, ?, ?, ?)', (data.id, data.username, data.avatar, data.publicKey))
    conn.commit()
    return data

class usernameValidation(BaseModel):
    username: str

@app.post("/config/validate")
async def validate_config(usernameVal: usernameValidation):
    cursor.execute('SELECT * FROM configs WHERE username = ?', (usernameVal.username,))
    row = cursor.fetchone()
    if row is None:
        return {"valid": True}
    return {"valid": False}

@app.get("/finduser/{username}")
async def find_user(username: str):
    username = username + "%"
    cursor.execute('SELECT * FROM configs WHERE username like ?', (username,))
    rows = cursor.fetchmany()

    for row in rows:
        if row[0] not in connections:
            rows.remove(row)

    return rows