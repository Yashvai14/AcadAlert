import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "data.csv")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "ml", "model.joblib")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "..", "ml", "scaler.joblib")

# Target Mapping
# Dropout -> High Risk (2)
# Enrolled -> Medium Risk (1)
# Graduate -> Low Risk (0)

TARGET_MAP = {"Dropout": 2, "Enrolled": 1, "Graduate": 0}

def train_models():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}. Run download script first.")
        
    df = pd.read_csv(DATA_PATH, sep=';')
    
    # Feature columns based on UCI Dataset schema
    # Common useful features for academic prediction. We'll use a subset that somewhat aligns
    # with typical student attributes or we use all to get the best model.
    # The dataset contains 36 features, target is 'Target'
    X = df.drop(columns=['Target'])
    y = df['Target'].map(TARGET_MAP)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print("Training Logistic Regression...")
    lr = LogisticRegression(max_iter=1000)
    lr.fit(X_train_scaled, y_train)
    lr_pred = lr.predict(X_test_scaled)
    print("LR Accuracy:", accuracy_score(y_test, lr_pred))
    
    print("Training Random Forest...")
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_train_scaled, y_train)
    rf_pred = rf.predict(X_test_scaled)
    print("RF Accuracy:", accuracy_score(y_test, rf_pred))
    
    print("Training XGBoost...")
    xgb = XGBClassifier(use_label_encoder=False, eval_metric='mlogloss', random_state=42)
    xgb.fit(X_train_scaled, y_train)
    xgb_pred = xgb.predict(X_test_scaled)
    print("XGB Accuracy:", accuracy_score(y_test, xgb_pred))
    
    # Pick the best model (usually XGBoost or Random Forest are best for this dataset)
    # Let's just pick XGBoost for demonstration since it's robust, or evaluate which one was best.
    best_acc = max(accuracy_score(y_test, lr_pred), accuracy_score(y_test, rf_pred), accuracy_score(y_test, xgb_pred))
    
    best_model = None
    if best_acc == accuracy_score(y_test, xgb_pred):
        print("Selecting XGBoost as Best Model")
        best_model = xgb
    elif best_acc == accuracy_score(y_test, rf_pred):
        print("Selecting Random Forest as Best Model")
        best_model = rf
    else:
        print("Selecting Logistic Regression as Best Model")
        best_model = lr
        
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(best_model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    
    print("Saved model and scaler successfully.")

if __name__ == "__main__":
    train_models()
