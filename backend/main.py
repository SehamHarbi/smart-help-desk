from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

import models
from database import engine, SessionLocal


app = FastAPI()


models.Base.metadata.create_all(bind=engine)


class Ticket(BaseModel):
    title: str
    description: str
    category: str | None = None
    priority: str | None = None


class TicketStatusUpdate(BaseModel):
    status: str


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
        description=ticket.description,
        category=ticket.category,
        priority=ticket.priority
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    return new_ticket


@app.get("/tickets")
def get_tickets(db: Session = Depends(get_db)):
    return db.query(models.Ticket).all()


@app.get("/tickets/{ticket_id}")
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = (
        db.query(models.Ticket)
        .filter(models.Ticket.id == ticket_id)
        .first()
    )

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    return ticket


@app.put("/tickets/{ticket_id}/status")
def update_ticket_status(
    ticket_id: int,
    update: TicketStatusUpdate,
    db: Session = Depends(get_db)
):
    ticket = (
        db.query(models.Ticket)
        .filter(models.Ticket.id == ticket_id)
        .first()
    )

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    ticket.status = update.status

    db.commit()
    db.refresh(ticket)

    return ticket