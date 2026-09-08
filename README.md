# 🍕 BillBreaker

Welcome to **BillBreaker**! This app uses AI to automatically scan your restaurant receipts, split the bill among your friends, and calculate exactly who owes what (including taxes and tips). No more doing math on napkins!

---

## ✨ Features
* **AI Receipt Scanning**: Upload a photo of your receipt and the app reads it for you.
* **Smart Splitting**: Divide items equally or assign specific items to specific friends.
* **Auto-Math**: It automatically figures out the exact tax, tip, and discounts for each person.
* **Friend Groups**: Save your squad to quickly split bills again later.
* **Dashboard**: See who you spend the most money with and on what.
* **PDF Export**: Download a neat PDF summary of the bill to share in the group chat.

---

## 🚀 How to Set Up and Run the App

If you want to run BillBreaker on your own computer, just follow these simple steps. It might look like a lot, but take it one step at a time!

### 1️⃣ What You Need Installed
Before you start, make sure you have these two things on your computer:
1. **Python** (Version 3.10 or newer) - For the backend.
2. **Node.js** (Version 18 or newer) - For the frontend.

### 2️⃣ Get the Code
Open your terminal (or Command Prompt / PowerShell on Windows) and type:
```bash
git clone https://github.com/UnboundSB/BillBreaker.git
cd BillBreaker
```

### 3️⃣ Set Up the Backend (The Brains 🧠)
The backend uses Python and FastAPI. We need to create a small "virtual environment" for it.

```bash
# Go into the backend folder
cd backend

# Create a virtual environment (like a mini-box just for this app's python stuff)
python -m venv venv

# Turn on the virtual environment!
# (If you are on Windows PowerShell, run this:)
.\venv\Scripts\Activate.ps1
# (If you are on Mac/Linux, run this:)
# source venv/bin/activate

# Install the required packages
pip install -r requirements.txt
```

**Almost there! You need an API Key.**
1. Go to [Google AI Studio](https://aistudio.google.com/) and create a free Gemini API Key.
2. In the `backend` folder, create a file named exactly `.env`.
3. Open it in a text editor and add this single line, pasting your real key:
   `GEMINI_API_KEY=your_api_key_here`

**Start the Backend!**
Run this command to turn the brain on:
```bash
uvicorn app.main:app --reload
```
Keep this terminal window open!

### 4️⃣ Set Up the Frontend (The Beautiful UI 🎨)
Open a **new** terminal window (leave the backend one running) and go to the frontend folder.

```bash
# From the main BillBreaker folder, go into the frontend
cd frontend

# Install the required packages
npm install

# Start the app!
npm run dev
```

### 5️⃣ You're Done! 🎉
When you run `npm run dev`, it will show you a URL (usually `http://localhost:5173`). 
Hold `Ctrl` (or `Cmd` on Mac) and click that link, or copy and paste it into your browser. 
Boom! You're ready to split bills!

---

## 🛠️ Built With
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Python, FastAPI, SQLAlchemy (SQLite), Google Gemini API
