from flask import Flask, render_template, request
import pandas as pd
import numpy as np
import joblib

app = Flask(__name__)

# Load model & preprocessing metadata
rf_model = joblib.load("model/rf_model.joblib")
rf_columns = joblib.load("model/rf_columns.joblib")
rf_skew_cols = joblib.load("model/rf_skew_cols.joblib")
rf_num_cols = joblib.load("model/rf_num_cols.joblib")

# Load dataset
df = pd.read_csv("realistic_supply_chain_10k.csv")

# Identify categorical columns
cat_cols = df.select_dtypes(include="object").columns.tolist()


# ---------------- PREPROCESS FUNCTION ----------------
def preprocess_input(input_dict):
    df_manual = pd.DataFrame([input_dict])

    # Fix unknown categories
    for c in cat_cols:
        if c in df_manual.columns:
            train_unique = df[c].unique()
            if df_manual.at[0, c] not in train_unique:
                df_manual.at[0, c] = "Other"

    # One-hot encode
    df_manual = pd.get_dummies(df_manual, drop_first=True)

    # Add missing columns
    for col in rf_columns:
        if col not in df_manual.columns:
            df_manual[col] = 0

    df_manual = df_manual[rf_columns]

    # Winsorize numeric columns
    for col in rf_num_cols:
        if col in df_manual.columns:
            low = df[col].quantile(0.01)
            high = df[col].quantile(0.99)
            df_manual[col] = df_manual[col].clip(lower=low, upper=high)

    # Log transform skewed
    for col in rf_skew_cols:
        if col in df_manual.columns and (df_manual[col] >= 0).all():
            df_manual[col] = np.log1p(df_manual[col])

    return df_manual

# ---------------- HOME PAGE (Prediction Form) ----------------
@app.route("/", methods=["GET", "POST"])
def home():
    prediction = None
    form_values = {}   # <-- store user inputs

    if request.method == "POST":
        input_data = {}

        for col in df.columns:
            if col == "Correct_Revenue":
                continue

            value = request.form.get(col)
            form_values[col] = value   # <-- STORE IT HERE

            # ---------------- FIX: SAFE NUMERIC CONVERSION ---------------
            if col in rf_num_cols:
                if value is None or value.strip() == "":
                    value = 0
                else:
                    try:
                        value = float(value)
                    except:
                        value = 0
            # ------------------------------------------------------------

            input_data[col] = value

        processed = preprocess_input(input_data)
        prediction = round(float(rf_model.predict(processed)[0]), 2)

    return render_template("index.html",
                           pred=prediction,
                           df=df,
                           form_values=form_values,   # <-- RETURN TO HTML
                           cat_cols=cat_cols,
                           num_cols=rf_num_cols)


# ---------------- EDA PAGE ----------------
@app.route("/eda")
def eda():
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include="object").columns.tolist()

    return render_template("eda.html",
                           df_json=df.to_dict(orient="records"),
                           numeric_cols=numeric_cols,
                           categorical_cols=categorical_cols)


# ---------------- ANALYTICS PAGE ----------------
@app.route("/analytics")
def analytics():
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if "Correct_Revenue" in numeric_cols:
        numeric_cols.remove("Correct_Revenue")

    categorical_cols = df.select_dtypes(include="object").columns.tolist()

    return render_template("analytics.html",
                           df_json=df.to_dict(orient="records"),
                           numeric_cols=numeric_cols,
                           categorical_cols=categorical_cols,
                           target="Correct_Revenue")


if __name__ == "__main__":
    app.run(debug=True)
