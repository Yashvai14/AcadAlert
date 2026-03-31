# AcadAlert: AI-Powered Student Risk Prediction System 🎓🤖

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-white?style=for-the-badge&logo=ollama&logoColor=black)

AcadAlert is a modern, end-to-end academic analytics dashboard built for educational institutions. It leverages a scikit-learn machine learning pipeline and localized Generative AI (Ollama) to rapidly identify at-risk students and provide actionable, personalized intervention strategies for faculty.

## ✨ Key Features
- **Live Faculty Dashboard**: View real-time attendance, internal marks, and risk breakdowns.
- **Predictive ML Pipeline**: Automated training using a Logistic Regression/Random Forest/XGBoost ensemble trained on the UCI Student Dropout Dataset.
- **Generative AI Insights**: Seamless integration with local `llama3` (or any Ollama-compatible model) to generate instant, privacy-preserving action plans for struggling students.
- **Fully Relational Database**: PostgreSQL architecture tracking complex student metric histories.

---

## 🛠️ Tech Stack
- **Frontend**: Next.js (React 19), Tailwind CSS, TypeScript, Lucide Icons, Recharts
- **Backend**: Python 3.10+, FastAPI, Uvicorn, SQLAlchemy
- **Database**: PostgreSQL (via `psycopg2`)
- **Machine Learning**: `scikit-learn`, `xgboost`, `pandas`
- **Generative AI**: Ollama (Local LLM Engine)

---

## ⚙️ Prerequisites
Ensure you have the following installed on your local machine:
1. [Node.js](https://nodejs.org/) (v18+)
2. [Python](https://www.python.org/downloads/) (v3.10+)
3. [PostgreSQL](https://www.postgresql.org/) (Running on default port `5432`)
4. [Ollama](https://ollama.com/) (For localized AI insights)

---

## 🚀 Installation & Setup

### 1. Database Setup
Create a new blank Postgres database named `acadalert`:
```sql
CREATE DATABASE acadalert;
```

### 2. Backend & Machine Learning Configuration
Navigate to the `backend` directory, create your Python virtual environment, and install all dependencies:
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file inside the `/backend` folder and add your Postgres credentials:
```env
# Format: postgresql://username:password@localhost:5432/database_name
DATABASE_URL=postgresql://postgres:your_password_here@localhost:5432/acadalert
```

### 3. Initialize the AI Pipeline
Run the included scripts to download the open-source UCI dataset, train your local ML model (`model.joblib`), and seed your Postgres database with dummy cohort data:
```bash
# Ensure you are still in the /backend directory with the venv active!
export PYTHONPATH="." # Use $env:PYTHONPATH="." on Windows PowerShell

python scripts/download_data.py
python scripts/train_model.py
python scripts/seed_db.py
```

### 4. Start the Application Servers

**Boot the FastAPI Backend:**
```bash
# From the /backend directory
python -m uvicorn main:app --reload
```
*Your API is now live at `http://127.0.0.1:8000`. Test it via `http://127.0.0.1:8000/docs`.*

**Boot the Next.js Frontend:**
Open a new terminal and run:
```bash
cd acadalert
npm install
npm run dev
```
*Your React dashboard is now live at `http://localhost:3000`.*

---

## 🧠 Using the Generative AI Feature
To utilize the beautiful "Analyze Profile" AI expansion on the Risk Analysis page without relying on expensive cloud APIs, simply start your local Ollama engine:

```bash
# This downloads and runs the local LLaMA 3 model
ollama run llama3
```
*Note: If `llama3` is too heavy for your hardware (~4.7GB), you can switch to `ollama run qwen2:0.5b` (~350MB). Remember to update `backend/ml/llm.py` so that `OLLAMA_MODEL = "qwen2:0.5b"`.*

---

## 📂 Project Structure
```text
/
├── acadalert/              # Next.js 14+ Frontend
│   ├── app/                # Application routes (Dashboard, Risk Analysis, etc.)
│   ├── components/         # Reusable React components (Charts, Tables)
│   └── lib/                # API Client wrappers
│
├── backend/                # FastAPI Application & ML Scripts
│   ├── data/               # Automatically downloaded datasets
│   ├── ml/                 # Generative AI adapters and scikit-learn models
│   ├── scripts/            # Training, downloading, and database seeding
│   ├── main.py             # core FastAPI router and endpoints
│   ├── models.py           # SQLAlchemy ORM definitions
│   └── schemas.py          # Pydantic typing configurations
```

---

## 🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. Please make sure to update tests as appropriate.

## 📝 License
[MIT](https://choosealicense.com/licenses/mit/)
