from fastapi import FastAPI, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

import models
from database import engine, SessionLocal


app = FastAPI()


models.Base.metadata.create_all(bind=engine)


class Ticket(BaseModel):
    title: str
    description: str


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@app.get("/")
def home():
    return {"message": "Smart Help Desk API is running"}


@app.post("/tickets")
def create_ticket(ticket: Ticket, db: Session = Depends(get_db)):
    new_ticket = models.Ticket(
        title=ticket.title,
        description=ticket.description
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    return new_ticket


@app.get("/tickets")
def get_tickets(db: Session = Depends(get_db)):
    return db.query(models.Ticket).all()