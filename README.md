## NexFlow — Workflow Automation Engine

 NexFlow is a full-stack workflow automation platform that allows users to design workflows, define conditional rules, execute processes, and track every step in real time.
 
Built with Django REST Framework (backend) + React (frontend) + MySQL (database).
.

🧩 Key Features

✅ Create and manage automation workflows
✅ Define steps (Task, Approval, Notification)
✅ Rule Engine — dynamic condition evaluation
✅ Execute workflows with real input data
✅ Full execution logs with step-by-step tracking
✅ Audit Log — compliance and history tracking
✅ Dark / Light mode toggle
✅ Search and filter workflows

## Tech Stack

Backend - Django REST Framework
Database - MySQL
Frontend - React+Vite
Styling  - Inline CSS

## Project Structure

nexflow/
├── config/              # Django settings, URLs
├── workflows/           # Workflow, Step, Rule models & APIs
├── executions/          # Execution engine & APIs
├── manage.py
├── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── pages/
    │   │   ├── WorkflowList.jsx
    │   │   ├── WorkflowEditor.jsx
    │   │   ├── RuleEditor.jsx
    │   │   ├── ExecuteWorkflow.jsx
    │   │   ├── ExecutionView.jsx
    │   │   └── AuditLog.jsx
    │   ├── services/
    │   │   └── api.js
    │   └── App.jsx
    └── package.json
## Backend Setup

# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/nexflow.git
cd nexflow

# 2. Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create MySQL database
mysql -u root -p
CREATE DATABASE halleyx_workflow;
exit

# 5. Configure database in config/settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'halleyx_workflow',
        'USER': 'root',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}

# 6. Run migrations
python manage.py makemigrations
python manage.py migrate

# 7. Start server
python manage.py runserver
Backend runs at: http://127.0.0.1:8000

## Frontend Setup
# 1. Go to frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
Frontend runs at: http://localhost:5173


## Screenshots
<img width="1902" height="910" alt="Screenshot 2026-03-18 092308" src="https://github.com/user-attachments/assets/fe90b4cb-8402-4848-a0fe-6ebdc86f1ed9" />
<img width="1825" height="906" alt="Screenshot 2026-03-18 092358" src="https://github.com/user-attachments/assets/6f36bb32-7654-4a20-920f-f0c48cf86094" />
<img width="1876" height="895" alt="Screenshot 2026-03-18 092425" src="https://github.com/user-attachments/assets/755ab547-fe18-48dc-b03a-7007f250c6b1" />
<img width="1887" height="875" alt="Screenshot 2026-03-18 092529" src="https://github.com/user-attachments/assets/7ef3a187-ab08-42b3-b2ed-8bbf4555544b" />

<img width="1905" height="835" alt="Screenshot 2026-03-18 092547" src="https://github.com/user-attachments/assets/c981200a-cf0b-404e-a82a-c0ae4e8ca2de" />

## 🎬 Demo Video

https://github.com/user-attachments/assets/6b1b4aed-3250-4ab1-aa23-144104ba76f5
https://github.com/user-attachments/assets/417038ba-cce0-498a-9039-1f852411a413



