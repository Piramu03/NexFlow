# NexFlow — Workflow Automation Engine
---

## 🚀 Overview

**NexFlow** is a full-stack workflow automation platform that allows users to design workflows, define conditional rules, execute processes, and track every step in real time.

Built with **Django REST Framework** (backend) + **React** (frontend) + **MySQL** (database).

---

## 🧩 Key Features

- ✅ Create and manage automation workflows
- ✅ Define steps (Task, Approval, Notification)
- ✅ Rule Engine — dynamic condition evaluation
- ✅ Execute workflows with real input data
- ✅ Full execution logs with step-by-step tracking
- ✅ Audit Log — compliance and history tracking
- ✅ Dark / Light mode toggle
- ✅ Search and filter workflows

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 4.2 + Django REST Framework |
| Database | MySQL |
| Frontend | React + Vite |
| Styling | Inline CSS (TantranZm Dark Orange Theme) |

---

## 📁 Project Structure

```
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
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL

---

### Backend Setup

```bash
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
```

Backend runs at: `http://127.0.0.1:8000`

---

### Frontend Setup

```bash
# 1. Go to frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔌 API Endpoints

### Workflows
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/workflows/` | Create workflow |
| GET | `/api/workflows/` | List workflows |
| GET | `/api/workflows/{id}/` | Get workflow details |
| PUT | `/api/workflows/{id}/` | Update workflow |
| DELETE | `/api/workflows/{id}/` | Delete workflow |

### Steps
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/workflows/{id}/steps/` | Add step |
| GET | `/api/workflows/{id}/steps/` | List steps |
| PUT | `/api/workflows/{id}/steps/{id}/` | Update step |
| DELETE | `/api/workflows/{id}/steps/{id}/` | Delete step |

### Rules
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/workflows/{id}/steps/{id}/rules/` | Add rule |
| GET | `/api/workflows/{id}/steps/{id}/rules/` | List rules |
| PUT | `/api/workflows/{id}/steps/{id}/rules/{id}/` | Update rule |
| DELETE | `/api/workflows/{id}/steps/{id}/rules/{id}/` | Delete rule |

### Executions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/workflows/{id}/execute/` | Start execution |
| GET | `/api/executions/` | List all executions |
| GET | `/api/executions/{id}/` | Get execution details |
| POST | `/api/executions/{id}/cancel/` | Cancel execution |
| POST | `/api/executions/{id}/retry/` | Retry failed execution |

---

## 🧠 Rule Engine

The rule engine evaluates conditions dynamically at runtime.

### Supported Operators
```
Comparison : ==, !=, <, >, <=, >=
Logical    : && (AND), || (OR)
String     : contains(field, 'value')
             startsWith(field, 'prefix')
             endsWith(field, 'suffix')
```

### Example Rules
```
amount > 100 && country == 'US'
priority == 'High' || amount > 500
contains(department, 'Finance')
DEFAULT  ← always matches (fallback)
```

### How It Works
```
1. Rules sorted by priority (lowest = first)
2. Each condition evaluated against input data
3. First matching rule → selects next step
4. DEFAULT rule → fallback if nothing matches
5. No rules → workflow ends
```

---

## 📊 Sample Workflow — Expense Approval

**Input Schema:**
```json
{
  "amount":     { "type": "number",  "required": true },
  "country":    { "type": "string",  "required": true },
  "priority":   { "type": "string",  "required": true,
                  "allowed_values": ["High","Medium","Low"] },
  "department": { "type": "string",  "required": false }
}
```

**Steps & Rules:**
```
Step 1: Manager Approval (approval)
  Rule 1: amount > 100 && country == 'US' && priority == 'High'
          → Finance Notification
  Rule 2: amount <= 100
          → CEO Approval
  Rule 3: priority == 'Low' && country != 'US'
          → Task Rejection
  Rule 4: DEFAULT
          → Task Rejection

Step 2: Finance Notification (notification)
Step 3: CEO Approval (approval)
Step 4: Task Rejection (task)
```

**Test Execution:**
```json
Input:  { "amount": 250, "country": "US", "priority": "High" }
Result: Manager Approval → Finance Notification → COMPLETED ✅
```

---

## 🗄️ Database Models

### Workflow
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| name | string | Workflow name |
| version | integer | Auto-increments on update |
| is_active | boolean | Active status |
| input_schema | JSON | Input field definitions |

### Step
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| workflow | FK | Parent workflow |
| name | string | Step name |
| step_type | enum | task / approval / notification |
| order | integer | Execution sequence |

### Rule
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| step | FK | Parent step |
| condition | string | Logic expression |
| next_step | FK | Next step to execute |
| priority | integer | Evaluation order |

### Execution
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| workflow | FK | Executed workflow |
| workflow_version | integer | Version at execution time |
| status | enum | pending / in_progress / completed / failed / cancelled |
| data | JSON | Input data provided |
| logs | JSON | Step execution logs |

---

## 🎨 UI Features

- **Dark / Light Mode** — toggle persists via localStorage
- **NexFlow Branding** — clean uppercase bold typography
- **Orange Accent** — `#f97316` primary color throughout
- **Responsive Table** — hover with left border slide effect
- **Real-time Search** — filter workflows instantly

---

## 📋 Evaluation Criteria Met

| Criteria | Weight | Status |
|----------|--------|--------|
| Backend / APIs | 20% | ✅ Complete |
| Rule Engine | 20% | ✅ Dynamic evaluation |
| Workflow Execution | 20% | ✅ Step tracking + logs |
| Frontend / UI | 15% | ✅ All screens built |
| Code Quality | 5% | ✅ Modular and clean |

---

## 👩‍💻 Author

**Piramu**
- Project: NexFlow — Halleyx Full Stack Challenge I 2026
- Stack: Django REST Framework + React + MySQL


## Screenshots
<img width="1902" height="910" alt="Screenshot 2026-03-18 092308" src="https://github.com/user-attachments/assets/fe90b4cb-8402-4848-a0fe-6ebdc86f1ed9" />
<img width="1825" height="906" alt="Screenshot 2026-03-18 092358" src="https://github.com/user-attachments/assets/6f36bb32-7654-4a20-920f-f0c48cf86094" />
<img width="1876" height="895" alt="Screenshot 2026-03-18 092425" src="https://github.com/user-attachments/assets/755ab547-fe18-48dc-b03a-7007f250c6b1" />
<img width="1909" height="836" alt="Screenshot 2026-03-18 141452" src="https://github.com/user-attachments/assets/54ab8536-4894-4166-9f23-34a49b50cfd9" />
<img width="1909" height="905" alt="Screenshot 2026-03-18 141508" src="https://github.com/user-attachments/assets/be87b107-f953-4b44-8277-7c432efdc450" />

<img width="1887" height="875" alt="Screenshot 2026-03-18 092529" src="https://github.com/user-attachments/assets/7ef3a187-ab08-42b3-b2ed-8bbf4555544b" />

<img width="1905" height="835" alt="Screenshot 2026-03-18 092547" src="https://github.com/user-attachments/assets/c981200a-cf0b-404e-a82a-c0ae4e8ca2de" />

## 🎬 Demo Video

https://github.com/user-attachments/assets/cda4ff15-120d-47d7-adb6-f90e68a5e188




