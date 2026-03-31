from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class StudentBase(BaseModel):
    name: str
    roll_number: str
    department: str

class StudentCreate(StudentBase):
    pass

class StudentOut(StudentBase):
    id: str
    attendance_percentage: float
    average_marks: float
    risk_level: str

    class Config:
        from_attributes = True

class AttendanceBase(BaseModel):
    student_id: str
    date: datetime
    status: str

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceOut(AttendanceBase):
    id: str

    class Config:
        from_attributes = True

class MarkBase(BaseModel):
    student_id: str
    subject: str
    marks: float
    max_marks: float

class MarkCreate(MarkBase):
    pass

class MarkOut(MarkBase):
    id: str

    class Config:
        from_attributes = True

class AssignmentBase(BaseModel):
    student_id: str
    assignment_title: str
    deadline: datetime
    submission_date: Optional[datetime] = None
    status: str

class AssignmentCreate(AssignmentBase):
    pass

class AssignmentOut(AssignmentBase):
    id: str

    class Config:
        from_attributes = True

class RiskPredictionOutput(BaseModel):
    student_id: str
    student_name: str
    attendance_percentage: float
    average_marks: float
    assignment_delay_count: int
    predicted_risk: str
