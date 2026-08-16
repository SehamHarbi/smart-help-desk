from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text
from database import Base


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=True)
    priority = Column(String(50), nullable=True)
    status = Column(String(50), default="Open")
    created_at = Column(DateTime, default=datetime.utcnow)