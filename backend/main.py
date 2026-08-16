from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class Ticket(BaseModel):
    title: str
    description: str


tickets = []


@app.get("/")
def home():
    return {"message": "Smart Help Desk API is running"}


@app.post("/tickets")
def create_ticket(ticket: Ticket):
    tickets.append(ticket)
    return ticket


@app.get("/tickets")
def get_tickets():
    return tickets