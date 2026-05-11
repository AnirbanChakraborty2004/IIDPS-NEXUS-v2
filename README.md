# IIDPS-NEXUS: Intelligent Intrusion Detection & Prevention System

![Python](https://img.shields.io/badge/python-3.9%2B-blue)
![React](https://img.shields.io/badge/react-18-blue)

IIDPS-NEXUS is a next-generation cybersecurity ecosystem. It is an advanced Proof-of-Concept (POC) Intelligent Intrusion Detection and Prevention System that utilizes Machine Learning for threat detection and features a real-time voice interaction interface, "Vanguard AI".

## 🎯 Features

- **Real-time Network Monitoring**: Simulates and tracks network traffic features such as bytes per second, distinct IPs, and packet sizes.
- **Machine Learning Threat Detection**: Utilizes `scikit-learn` (Random Forest / Isolation Forest) to evaluate network features in real-time and flag intrusions like DDoS or Port Scans.
- **Simulated Prevention**: Maintains a firewall blocklist to actively respond to detected threats.
- **Vanguard AI (Voice Assistant)**: A robust voice functionality using the Web Speech API to interact with the system naturally. Ask the system "What is the current threat level?" and hear it report back successfully.
- **Premium Security Dashboard**: A dark-mode, glassmorphism UI with neon accents displaying live traffic graphs, recent threats, and blocked IPs.

## 🏗️ Architecture

The system is modularly split into two main components:

### Backend (Python + FastAPI)
- **API Engine**: Serves data to the frontend and receives voice queries.
- **Traffic Monitor**: Generates realistic simulated network flow telemetry (or captures live packets).
- **ML Detection Engine**: A Python component using `scikit-learn` that evaluates network features in real-time.
- **IIDPS Logic Controller**: Manages the "Prevention" strategies and handles the AI responses.

### Frontend (React + Vite)
- **Security Dashboard**: Built with React and Vite for a scalable and fast UI.
- **Voice Assistant Interface**: Browser-based Web Speech API integration.

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+

### 1. Backend Setup

Navigate to the backend directory, install dependencies, and start the FastAPI server:

```bash
cd backend
python -m venv venv

# On Windows: 
venv\Scripts\activate
# On Linux/Mac: 
# source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```
The backend will run on `http://127.0.0.1:8000`.

### 2. Frontend Setup

Navigate to the frontend directory, install dependencies, and start the Vite development server:

```bash
cd frontend
npm install
npm run dev
```
The frontend will typically run on `http://localhost:5173`.

## 🧪 Testing the System
- Open the Frontend dashboard in your browser.
- View the simulated traffic flowing on the dashboard.
- The ML engine will automatically flag anomalies based on the traffic simulation.
- Use the microphone button to interact with Vanguard AI. Try asking: *"What is the current system status?"*

## ⚠️ Disclaimer
This is a Proof of Concept (PoC) built for educational and demonstration purposes. It utilizes a network simulator by default to allow the ML model and dashboard to function immediately without requiring Administrator/Root privileges or complex network configurations.
