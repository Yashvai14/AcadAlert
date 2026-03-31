from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
import os
import random
import logging

from database import engine, Base, get_db
import models, schemas
from ml.predictor import init_model, predict_risk

# Create tables
# Note: For production use alembic
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AcadAlert Backend", description="Predicts student academic risk")

# Allow NextJS frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Attempt to load the trained model on startup
    init_model()

@app.get("/")
def root():
    return {"message": "Welcome to AcadAlert API"}


# ----- STUDENTS -----
@app.get("/students", response_model=list[schemas.StudentOut])
def read_students(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    students = db.query(models.Student).offset(skip).limit(limit).all()
    return students

@app.post("/students", response_model=schemas.StudentOut)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    db_student = models.Student(
        id=str(uuid.uuid4())[:8],
        name=student.name,
        roll_number=student.roll_number,
        department=student.department,
        attendance_percentage=100.0,
        average_marks=100.0,
        risk_level="Low"
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

# ----- ATTENDANCE -----
@app.get("/attendance", response_model=list[schemas.AttendanceOut])
def read_attendance(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Attendance).offset(skip).limit(limit).all()

@app.post("/attendance", response_model=schemas.AttendanceOut)
def create_attendance(attendance: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    db_att = models.Attendance(
        id=str(uuid.uuid4()),
        student_id=attendance.student_id,
        date=attendance.date,
        status=attendance.status
    )
    db.add(db_att)
    db.commit()
    db.refresh(db_att)
    
    # Update student attendance percentage
    student = db.query(models.Student).filter(models.Student.id == attendance.student_id).first()
    if student:
        total = db.query(models.Attendance).filter(models.Attendance.student_id == student.id).count()
        present = db.query(models.Attendance).filter(
            models.Attendance.student_id == student.id, 
            models.Attendance.status == "Present"
        ).count()
        if total > 0:
            student.attendance_percentage = (present / total) * 100
            
            # Repredict risk
            student.risk_level = predict_risk(student, db)
            db.commit()
            
    return db_att


# ----- MARKS -----
@app.get("/marks", response_model=list[schemas.MarkOut])
def read_marks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Mark).offset(skip).limit(limit).all()

@app.post("/marks", response_model=schemas.MarkOut)
def create_mark(mark: schemas.MarkCreate, db: Session = Depends(get_db)):
    db_mark = models.Mark(
        id=str(uuid.uuid4()),
        student_id=mark.student_id,
        subject=mark.subject,
        marks=mark.marks,
        max_marks=mark.max_marks
    )
    db.add(db_mark)
    db.commit()
    db.refresh(db_mark)
    
    # Update student average marks
    student = db.query(models.Student).filter(models.Student.id == mark.student_id).first()
    if student:
        all_marks = db.query(models.Mark).filter(models.Mark.student_id == student.id).all()
        if all_marks:
            # We standardize as percentages 
            percentages = [(m.marks / m.max_marks) * 100 for m in all_marks if m.max_marks > 0]
            if percentages:
                student.average_marks = sum(percentages) / len(percentages)
                # Repredict risk
                student.risk_level = predict_risk(student, db)
                db.commit()
                
    return db_mark

# ----- ASSIGNMENTS -----
@app.get("/assignments", response_model=list[schemas.AssignmentOut])
def read_assignments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Assignment).offset(skip).limit(limit).all()

@app.post("/assignments", response_model=schemas.AssignmentOut)
def create_assignment(assignment: schemas.AssignmentCreate, db: Session = Depends(get_db)):
    db_assign = models.Assignment(
        id=str(uuid.uuid4()),
        student_id=assignment.student_id,
        assignment_title=assignment.assignment_title,
        deadline=assignment.deadline,
        submission_date=assignment.submission_date,
        status=assignment.status
    )
    db.add(db_assign)
    db.commit()
    db.refresh(db_assign)
    return db_assign


# ----- PREDICTIONS -----
@app.get("/risk-predictions", response_model=list[schemas.RiskPredictionOutput])
def get_risk_predictions(db: Session = Depends(get_db)):
    # Calculate for all current students
    students = db.query(models.Student).all()
    results = []
    
    for s in students:
        delays = db.query(models.Assignment).filter(
            models.Assignment.student_id == s.id, 
            models.Assignment.status == "Late"
        ).count()
        
        # We ensure it syncs with DB
        risk = predict_risk(s, db)
        if s.risk_level != risk:
            s.risk_level = risk
            db.commit()
            
        results.append({
            "student_id": s.id,
            "student_name": s.name,
            "attendance_percentage": s.attendance_percentage,
            "average_marks": s.average_marks,
            "assignment_delay_count": delays,
            "predicted_risk": risk
        })
        
    return results

@app.get("/students/{student_id}/insights")
def get_student_insights(student_id: str, db: Session = Depends(get_db)):
    from ml.llm import generate_student_insights
    
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    delays = db.query(models.Assignment).filter(
        models.Assignment.student_id == student.id, 
        models.Assignment.status == "Late"
    ).count()
    
    # Pack data
    student_data = {
        "name": student.name,
        "department": student.department,
        "attendance_percentage": student.attendance_percentage,
        "average_marks": student.average_marks,
        "assignment_delay_count": delays,
        "predicted_risk": student.risk_level
    }
    
    # Generate directly (dynamic inference without db caching)
    insights = generate_student_insights(student_data)
    
    return {
        "student_id": student.id,
        "insights": insights
    }

@app.post("/train")
def trigger_training():
    from scripts.train_model import train_models
    try:
        train_models()
        init_model() # Reload
        return {"message": "Models retrained and reloaded successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
