import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session

import models
from database import SessionLocal, engine
from ai_service import analyze_ticket


load_dotenv()


app = FastAPI()


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8

security = HTTPBearer()


def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


models.Base.metadata.create_all(bind=engine)

class CommentCreate(BaseModel):
    message: str


class Ticket(BaseModel):
    title: str
    description: str


class TicketStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, value):
        if value not in ["Open", "In Progress", "Resolved"]:
            raise ValueError(
                "Status must be Open, In Progress, or Resolved"
            )

        return value


class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token"
            )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )

    user = (
        db.query(models.User)
        .filter(models.User.id == int(user_id))
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user

def require_admin(
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user


@app.get("/")
def home():
    return {
        "message": "Smart Help Desk API is running"
    }


@app.post("/tickets")
def create_ticket(
    ticket: Ticket,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        ai_result = analyze_ticket(
            ticket.title,
            ticket.description
        )

        category = ai_result["category"]
        priority = ai_result["priority"]
        ai_suggestion = ai_result["suggestion"]

        allowed_categories = [
            "Hardware",
            "Software",
            "Network",
            "Account",
            "Other"
        ]

        allowed_priorities = [
            "Low",
            "Medium",
            "High"
        ]

        if category not in allowed_categories:
            category = "Other"

        if priority not in allowed_priorities:
            priority = None

    except Exception as e:
        print("AI analysis failed:", e)

        category = None
        priority = None
        ai_suggestion = None

    new_ticket = models.Ticket(
        owner_id=current_user.id,
        title=ticket.title,
        description=ticket.description,
        category=category,
        priority=priority,
        ai_suggestion=ai_suggestion
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    return new_ticket

@app.get("/tickets")
def get_tickets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role == "admin":
        return db.query(models.Ticket).all()

    return (
        db.query(models.Ticket)
        .filter(
            models.Ticket.owner_id == current_user.id,
            models.Ticket.is_archived == False
        )
        .all()
    )

@app.get("/tickets/archived")
def get_archived_tickets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return (
        db.query(models.Ticket)
        .filter(
            models.Ticket.owner_id == current_user.id,
            models.Ticket.is_archived == True
        )
        .all()
    )

@app.get("/tickets/{ticket_id}")
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
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

    if (
        current_user.role != "admin"
        and ticket.owner_id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this ticket"
        )

    return ticket

@app.put("/tickets/{ticket_id}/archive")
def archive_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    ticket = (
        db.query(models.Ticket)
        .filter(
            models.Ticket.id == ticket_id,
            models.Ticket.owner_id == current_user.id
        )
        .first()
    )

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    if ticket.status != "Resolved":
        raise HTTPException(
            status_code=400,
            detail="Only resolved tickets can be archived"
        )

    ticket.is_archived = True

    db.commit()
    db.refresh(ticket)

    return {
        "message": "Ticket archived successfully",
        "ticket_id": ticket.id,
        "is_archived": ticket.is_archived
    }

@app.put("/tickets/{ticket_id}/status")
def update_ticket_status(
    ticket_id: int,
    update: TicketStatusUpdate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(require_admin)
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


@app.post("/users")
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = (
        db.query(models.User)
        .filter(models.User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = pwd_context.hash(
        user.password
    )

    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "role": new_user.role
    }


@app.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):
    db_user = (
        db.query(models.User)
        .filter(models.User.email == user.email)
        .first()
    )

    if db_user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    password_matches = pwd_context.verify(
        user.password,
        db_user.password
    )

    if not password_matches:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        {
            "sub": str(db_user.id),
            "email": db_user.email,
            "role": db_user.role
        }
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "role": db_user.role
        }
    }


@app.get("/me")
def get_me(
    current_user: models.User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role
    }

@app.post("/tickets/{ticket_id}/comments")
def create_comment(
    ticket_id: int,
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
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

    if (
        current_user.role != "admin"
        and ticket.owner_id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this ticket"
        )

    if ticket.is_archived:
        raise HTTPException(
            status_code=400,
            detail="Comments cannot be added to an archived ticket"
        )

    new_comment = models.Comment(
        ticket_id=ticket.id,
        user_id=current_user.id,
        message=comment.message
    )

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return new_comment

@app.get("/tickets/{ticket_id}/comments")
def get_comments(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
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

    if (
        current_user.role != "admin"
        and ticket.owner_id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this ticket"
        )

    comments = (
        db.query(models.Comment)
        .filter(models.Comment.ticket_id == ticket_id)
        .order_by(models.Comment.created_at.asc())
        .all()
    )

    return comments
