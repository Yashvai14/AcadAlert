from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Student(Base):
    __tablename__ = "students"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    roll_number = Column(String, unique=True, index=True)
    department = Column(String)
    
    # We store the latest calculated values for quick access
    attendance_percentage = Column(Float, default=0.0)
    average_marks = Column(Float, default=0.0)
    risk_level = Column(String, default="Low") # "Low", "Medium", "High"

    attendances = relationship("Attendance", back_populates="student")
    marks = relationship("Mark", back_populates="student")
    assignments = relationship("Assignment", back_populates="student")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.id"))
    date = Column(DateTime, default=datetime.utcnow)
    status = Column(String) # "Present" | "Absent"
    
    student = relationship("Student", back_populates="attendances")

class Mark(Base):
    __tablename__ = "marks"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.id"))
    subject = Column(String)
    marks = Column(Float)
    max_marks = Column(Float)
    
    student = relationship("Student", back_populates="marks")

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.id"))
    assignment_title = Column(String)
    deadline = Column(DateTime)
    submission_date = Column(DateTime, nullable=True)
    status = Column(String) # "On Time" | "Late" | "Pending"
    
    student = relationship("Student", back_populates="assignments")
