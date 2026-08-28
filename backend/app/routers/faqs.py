from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Document
from app.schemas import FAQItem
from app.auth import get_current_user

router = APIRouter(prefix="/faqs", tags=["FAQs"])

STATIC_COLLEGE_FAQS = [
    {
        "id": "faq_1",
        "category": "Fees & Scholarships",
        "question": "What is the annual tuition fee for B.Tech Computer Science & Engineering (CSE)?",
        "answer": "The annual tuition fee for Computer Science & Engineering (CSE) is ₹1,85,000 per academic year. For AI & Data Science, it is ₹1,80,000, and for ECE it is ₹1,55,000.",
        "document_title": "Fee Structure And Scholarships"
    },
    {
        "id": "faq_2",
        "category": "Fees & Scholarships",
        "question": "What are the eligibility criteria for the Chairman's Merit Scholarship?",
        "answer": "A 100% tuition waiver is awarded to students in the top 1,000 rank of JEE Main or top 50 in State CET. A 50% waiver is given to students with >95% in 10+2 PCM or >98 percentile in JEE Main.",
        "document_title": "Fee Structure And Scholarships"
    },
    {
        "id": "faq_3",
        "category": "Academic Calendar",
        "question": "When do End-Semester theory examinations take place for Autumn and Spring semesters?",
        "answer": "Autumn Semester theory examinations are scheduled from 10 December to 24 December 2026. Spring Semester theory examinations run from 15 May to 30 May 2027.",
        "document_title": "Academic Calendar 2026 27"
    },
    {
        "id": "faq_4",
        "category": "Academic Calendar",
        "question": "What is the minimum attendance requirement to appear for exams?",
        "answer": "Students must maintain a minimum of 75% aggregate attendance in each theory and lab course. A medical condonation up to 10% (minimum 65%) can be granted on valid medical grounds.",
        "document_title": "Academic Calendar 2026 27"
    },
    {
        "id": "faq_5",
        "category": "Admissions",
        "question": "What documents are required during physical reporting for admission?",
        "answer": "Required documents include Class 10 & 12 marksheets, Entrance Exam rank card, Seat Allotment letter, Transfer Certificate (TC), Migration Certificate, Category/Income certificate (if applicable), Aadhar Card, 6 photos, and MBBS Medical Fitness certificate.",
        "document_title": "Admission Guidelines And Eligibility"
    },
    {
        "id": "faq_6",
        "category": "Hostel Life",
        "question": "What are the hostel curfew timings and dining mess hours?",
        "answer": "Biometric entry cutoff is strictly 09:30 PM. Mess meal timings are: Breakfast (7:30-9:00 AM), Lunch (12:30-2:00 PM), High-Tea (5:00-6:00 PM), and Dinner (7:30-9:30 PM).",
        "document_title": "Hostel Rules And Facilities"
    },
    {
        "id": "faq_7",
        "category": "Placements",
        "question": "What are the placement statistics and top recruiting companies?",
        "answer": "The overall placement rate is 94.2% with an average CTC of ₹9.2 LPA (₹11.4 LPA for CSE & AI/DS) and highest international CTC of ₹44 LPA. Top recruiters include Google, Microsoft, Amazon, Oracle, Goldman Sachs, and TCS.",
        "document_title": "Placement Policy And Statistics"
    },
    {
        "id": "faq_8",
        "category": "Placements",
        "question": "What is the minimum CGPA required to register for campus placements?",
        "answer": "Students must possess an aggregate CGPA of 6.5 or above across all completed semesters with no standing backlogs, and minimum 85% attendance in Career Development Centre training.",
        "document_title": "Placement Policy And Statistics"
    }
]

@router.get("", response_model=List[FAQItem])
def get_all_faqs():
    """Retrieve categorized frequently asked questions generated from college records."""
    return STATIC_COLLEGE_FAQS
