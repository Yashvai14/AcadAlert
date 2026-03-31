import os
import requests
import json
import logging

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")

def generate_student_insights(student_data: dict) -> dict:
    """
    Sends student data to local Ollama instance and asks for a JSON breakdown of their risk.
    """
    prompt = f"""
You are an expert academic advisor bot. Please analyze this student's risk profile and provide actionable insights for an educator.

Student Name: {student_data.get('name')}
Department: {student_data.get('department')}
Attendance Percentage: {student_data.get('attendance_percentage')}%
Average Internal Marks: {student_data.get('average_marks')}/100
Late Assignments: {student_data.get('assignment_delay_count')}
Model's Predicted Risk: {student_data.get('predicted_risk')}

Your entire output MUST be exactly one valid JSON object containing exactly two keys:
1. "reasons": an array of 2-3 short, bullet-pointed strings explaining why they might be at {student_data.get('predicted_risk')} risk based on the data.
2. "action_plan": an array of 2-3 short, specific, actionable steps a faculty member can take right now to help this student.

Example format:
{{
  "reasons": ["Attendance is critically low at 45%", "Average marks are borderline passing"],
  "action_plan": ["Schedule a 1-on-1 meeting to discuss attendance", "Provide extra credit options for math"]
}}

Return ONLY valid JSON. Keep insights professional, direct, and constructive.
"""

    try:
        response = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "format": "json" # Ollama 0.1.29+ enforces JSON output natively with this
            },
            timeout=30 # Keep a reasonable timeout
        )
        response.raise_for_status()
        res_data = response.json()
        
        # Ollama's response payload is in the 'response' key
        llm_response = res_data.get("response", "{}")
        
        try:
            return json.loads(llm_response)
        except json.JSONDecodeError:
            logging.error(f"Ollama returned invalid JSON: {llm_response}")
            return {
                "reasons": ["Error parsing AI response. The model may have returned unstructured text."],
                "action_plan": ["Please ensure your local Ollama model handles JSON requests correctly."]
            }

    except Exception as e:
        logging.error(f"Error calling Ollama: {e}")
        return {
            "reasons": [f"Connection to Ollama failed: {str(e)}"],
            "action_plan": ["Check if Ollama is running locally on port 11434.", "Verify you have pulled the requested model (e.g., 'ollama run llama3')."]
        }
