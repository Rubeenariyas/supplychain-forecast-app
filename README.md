📦 Supply Chain Forecasting & Optimization System

A complete Machine Learning–based Supply Chain Forecasting System that predicts demand, analyzes historical trends, and optimizes inventory planning.
This project includes EDA, feature engineering, model building, evaluation, and a web deployment interface (Flask) for practical use.

🚀 Project Overview

Supply chain decisions are often made manually, which leads to stockouts, overstocking, or delayed production.
This project solves that problem using predictive analytics.

✔ Predicts future demand
✔ Helps reduce inventory cost
✔ Improves supply chain efficiency
✔ Supports data-driven business decisions

📊 Features

🔹 Data Cleaning & Preprocessing

🔹 Exploratory Data Analysis (EDA)

🔹 Feature Engineering

🔹 Multiple ML Models (Linear Regression, RandomForest, XGBoost, etc.)

🔹 Model Evaluation (RMSE, MAE, R² Score)

🔹 Prediction on New Data

🔹 Flask Web App for user input & prediction

🔹 Modern UI with HTML, CSS (Bootstrap), JavaScript

🧠 Tech Stack
Machine Learning

Python

Pandas

NumPy

Scikit-Learn

Matplotlib / Seaborn

XGBoost (optional)

Web Deployment

Flask

HTML5

CSS3 / Bootstrap

JavaScript

Tools

VS Code

Git & GitHub

Jupyter Notebook

🗂️ Project Structure
📦 SupplyChain-Forecasting
│
├── 📁 static/               
│     ├── style.css          
│     ├── script.js          
│
├── 📁 templates/
│     ├── index.html        
│     ├── result.html       
│
├── app.py                  # Flask Application
├── model.pkl               # Trained Model
├── scaler.pkl              # Scaler for preprocessing
├── supplychain.ipynb       # Jupyter ML notebook
├── requirements.txt        # Dependencies
└── README.md               # Project Documentation

📥 Dataset Description

Your dataset includes:

Product Name

Price

Category

Quantity

Location details

Date

Historical sales

Corrected revenue / actual revenue values

The model learns from past patterns to forecast future demand.

⚙️ How to Run Locally
🔹 1. Clone the repository
git clone https://github.com/yourusername/supplychain-forecasting.git
cd supplychain-forecasting

🔹 2. Create a virtual environment
python -m venv venv

🔹 3. Activate it

Windows:

venv\Scripts\activate


Mac/Linux:

source venv/bin/activate

🔹 4. Install dependencies
pip install -r requirements.txt

🔹 5. Run the Flask App
python app.py


Visit:
👉 http://127.0.0.1:5000

📈 Model Performance

The following metrics were used to evaluate the regression model:

✔ R² Score

✔ RMSE (Root Mean Squared Error)

✔ MAE (Mean Absolute Error)

These results help measure prediction accuracy and compare multiple machine-learning models.

🌐 Web App Features

Modern UI (Bootstrap)

Dropdowns for categorical inputs

Dynamic prediction output

Clean layout

Fully responsive

🚀 Future Enhancements

Add Power BI dashboard

Add LSTM time-series forecasting

Add database (MongoDB / MySQL)

Deploy on Render / AWS / Railway

👩‍💻 Author

Rubeena Riyas
Data Science | Machine Learning | Python | MERN Stack
📧 rubeenariyas@gmail.com
