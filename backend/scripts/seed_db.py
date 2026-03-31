import os
import random
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from backend.database import SessionLocal, Base, engine
from backend.models import Student, Attendance, Mark

# Setup Database
Base.metadata.create_all(bind=engine)

def seed_db():
    db = SessionLocal()
    
    # Check if empty
    if db.query(Student).count() > 0:
        print("Database already seeded.")
        return
        
    print("Seeding database with generated students based on UCI mapping...")
    
    # Let's seed 10 varied students to show the dashboard
    departments = ["Computer Science", "Engineering", "Business", "Arts"]
    
    for i in range(1, 16):
        s_id = str(uuid.uuid4())[:8]
        is_high_risk = random.random() < 0.2
        is_low_risk = random.random() > 0.4
        
        att_pct = random.uniform(85, 100) if is_low_risk else (random.uniform(40, 70) if is_high_risk else random.uniform(70, 85))
        avg_marks = random.uniform(75, 95) if is_low_risk else (random.uniform(30, 50) if is_high_risk else random.uniform(50, 75))
        risk_level = "Low" if is_low_risk else ("High" if is_high_risk else "Medium")
        
        student = Student(
            id=s_id,
            name=f"Student {i}",
            roll_number=f"RN{2024000+i}",
            department=random.choice(departments),
            attendance_percentage=att_pct,
            average_marks=avg_marks,
            risk_level=risk_level
        )
        db.add(student)
        
        # Add basic dummy relations
        att = Attendance(
            id=str(uuid.uuid4()),
            student_id=s_id,
            date=datetime.utcnow(),
            status="Present" if att_pct > 60 else "Absent"
        )
        db.add(att)
        
        mark = Mark(
            id=str(uuid.uuid4()),
            student_id=s_id,
            subject="Mathematics",
            marks=avg_marks,
            max_marks=100
        )
        db.add(mark)
        
    db.commit()
    db.close()
    print("Seeding complete.")

if __name__ == "__main__":
    seed_db()
