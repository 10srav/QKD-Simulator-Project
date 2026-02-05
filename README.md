# QKD Simulator

A production-grade **Quantum Key Distribution** simulator implementing **BB84** and **E91** protocols with real quantum circuits powered by **IBM Qiskit**.

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688?logo=fastapi&logoColor=white)
![Qiskit](https://img.shields.io/badge/Qiskit-1.0+-6929C4?logo=ibm&logoColor=white)
![React](https://img.shields.io/badge/React-19+-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start with Docker](#quick-start-with-docker)
- [Manual Setup](#manual-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Configuration](#environment-configuration)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [How It Works](#how-it-works)
- [Security Thresholds](#security-thresholds)
- [Running Tests](#running-tests)
- [Database](#database)
- [Troubleshooting](#troubleshooting)
- [References](#references)
- [License](#license)

---

## Features

### BB84 Protocol (Bennett-Brassard 1984)
- Full quantum circuit implementation with Qiskit Aer simulator
- Support for Z (Computational), X (Hadamard), and D (Diagonal) measurement bases
- Configurable qubit counts: 9, 12, or 16
- Eve's intercept-resend attack simulation with adjustable interception rate
- QBER (Quantum Bit Error Rate) calculation and threshold detection (8.5%)
- Configurable noise levels and simulation shots

### E91 Protocol (Ekert 1991)
- Entanglement-based QKD using EPR pairs (Bell states)
- CHSH inequality violation testing for quantum security verification
- Configurable measurement angles for Alice and Bob
- Configurable entangled pair counts: 6, 9, or 12
- Reverse gate anti-eavesdropping mechanism
- Correlation-based security analysis

### AES Encryption Tool
- AES-128, AES-192, and AES-256 encryption modes
- Uses quantum-generated keys from BB84/E91 simulations
- Privacy amplification for keys shorter than required length
- Encrypt and decrypt messages with copy/download support
- Displays algorithm metadata, key hash, and bits used

### Simulation History
- Auto-persisted simulation results (fire-and-forget pattern)
- SQLite by default, PostgreSQL for production
- Filter by protocol type, Eve attack presence, and security status
- Side-by-side comparison of any two simulations with delta calculations
- Custom labels for organizing experiments
- Paginated browsing with delete support

### Interactive Visualizations
- Quantum circuit renderer showing gate operations
- QBER gauge chart with threshold markers
- CHSH S-parameter meter with classical/quantum bounds
- Key visualization with bit-by-bit Alice vs Bob comparison
- Security analysis panel with recommendations

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4, Zustand 5, Recharts 3, Lucide Icons |
| **Backend** | FastAPI, Python 3.11+, Pydantic V2, SQLAlchemy 2 (async), Alembic |
| **Quantum** | IBM Qiskit 1.0+, Qiskit Aer Simulator |
| **Encryption** | PyCryptodome (AES-CBC) |
| **Database** | SQLite (default) / PostgreSQL 16 (production) |
| **Cache** | Redis 7 (optional, in-memory fallback) |
| **Testing** | pytest + pytest-asyncio, Vitest + Testing Library, Playwright |
| **DevOps** | Docker, Docker Compose |

---

## Prerequisites

- **Python** 3.11 or higher
- **Node.js** 20 or higher
- **npm** 10 or higher
- **Docker** and **Docker Compose** (optional, for containerized setup)

---

## Quick Start with Docker

The fastest way to get everything running with PostgreSQL and Redis:

```bash
# 1. Clone the repository
git clone https://github.com/10srav/QKD-Simulator-Project.git
cd QKD-Simulator-Project

# 2. Start all services
docker-compose up --build

# 3. Access the application
#    Frontend:  http://localhost:5173
#    Backend:   http://localhost:8000
#    API Docs:  http://localhost:8000/docs
```

Docker Compose starts four services:
- **PostgreSQL 16** — persistent database on port 5432
- **Redis 7** — caching layer on port 6379
- **FastAPI Backend** — API server on port 8000
- **React Frontend** — dev server on port 5173

To stop all services:
```bash
docker-compose down        # Stop containers
docker-compose down -v     # Stop and remove volumes (reset database)
```

---

## Manual Setup

### Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create environment file
cp .env.example .env

# 5. Run database migrations (optional, tables auto-create on startup)
alembic upgrade head

# 6. Start the development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at:
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Start the development server
npm run dev
```

The frontend will be available at http://localhost:5173

### Running Both Together

Open two terminal windows:

**Terminal 1 — Backend:**
```bash
cd backend
.\venv\Scripts\activate   # Windows
uvicorn app.main:app --reload
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

---

## Environment Configuration

### Backend (`backend/.env`)

```env
# Application
DEBUG=true
API_V1_PREFIX=/api/v1
PROJECT_NAME=QKD Simulator
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]

# Quantum Simulation
DEFAULT_SHOTS=1024
MAX_QUBITS=20

# Database — SQLite is used by default (no configuration needed)
# Uncomment below for PostgreSQL:
# DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/qkd_simulator

# Redis — Optional, falls back to in-memory cache if unavailable
# REDIS_URL=redis://localhost:6379
```

### Frontend (`frontend/.env`)

```env
# Backend API URL
VITE_API_URL=http://localhost:8000
```

---

## Project Structure

```
QKD-Simulator-Project/
├── backend/                          # FastAPI + Qiskit Backend
│   ├── app/
│   │   ├── main.py                   # FastAPI app entry point
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── router.py         # API route aggregator
│   │   │       └── endpoints/
│   │   │           ├── bb84.py       # BB84 simulation endpoint
│   │   │           ├── e91.py        # E91 simulation endpoint
│   │   │           ├── crypto.py     # AES encrypt/decrypt endpoints
│   │   │           ├── history.py    # Simulation history CRUD
│   │   │           └── health.py     # Health check endpoint
│   │   ├── protocols/                # Quantum protocol implementations
│   │   │   ├── bb84/                 # BB84 protocol modules
│   │   │   │   ├── circuit_builder.py
│   │   │   │   ├── key_sifting.py
│   │   │   │   └── eve_attack.py
│   │   │   ├── e91/                  # E91 protocol modules
│   │   │   │   ├── entanglement.py
│   │   │   │   ├── chsh_validator.py
│   │   │   │   └── reverse_gates.py
│   │   │   └── common/              # Shared quantum utilities
│   │   ├── analysis/                 # Security analysis
│   │   │   └── qber_calculator.py
│   │   ├── crypto/                   # AES encryption module
│   │   │   └── aes_encryption.py
│   │   ├── models/                   # Data models
│   │   │   ├── schemas.py            # Pydantic request/response schemas
│   │   │   ├── database.py           # SQLAlchemy ORM models
│   │   │   └── history_schemas.py    # History-specific schemas
│   │   ├── services/                 # Business logic
│   │   │   └── history_service.py    # History persistence service
│   │   └── core/                     # App configuration
│   │       ├── config.py             # Settings (pydantic-settings)
│   │       ├── database.py           # Async DB engine + sessions
│   │       └── cache.py              # Redis / in-memory cache
│   ├── alembic/                      # Database migrations
│   │   ├── alembic.ini
│   │   └── versions/
│   ├── tests/                        # Test suite
│   │   ├── unit/
│   │   └── integration/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                         # React + TypeScript Frontend
│   ├── src/
│   │   ├── App.tsx                   # Root component with routing
│   │   ├── main.tsx                  # React entry point
│   │   ├── index.css                 # Design system + global styles
│   │   ├── pages/
│   │   │   ├── HomePage.tsx          # Landing page with protocol selection
│   │   │   ├── BB84Page.tsx          # BB84 simulation interface
│   │   │   ├── E91Page.tsx           # E91 simulation interface
│   │   │   ├── EncryptionPage.tsx    # AES encryption tool
│   │   │   └── HistoryPage.tsx       # Simulation history browser
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.tsx        # Navigation bar
│   │   │   │   ├── ErrorBoundary.tsx # Error boundary wrapper
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   └── SimulationDetailModal.tsx
│   │   │   ├── visualization/
│   │   │   │   ├── CircuitRenderer.tsx    # Quantum circuit display
│   │   │   │   ├── QBERChart.tsx          # QBER gauge chart
│   │   │   │   ├── CHSHMeter.tsx          # CHSH S-parameter meter
│   │   │   │   └── KeyVisualization.tsx   # Key comparison display
│   │   │   └── analysis/
│   │   │       └── SecurityAnalysis.tsx   # Security report panel
│   │   ├── services/                 # API client layer
│   │   │   ├── api.ts                # Axios instance configuration
│   │   │   ├── bb84Service.ts        # BB84 API calls
│   │   │   ├── e91Service.ts         # E91 API calls
│   │   │   ├── cryptoService.ts      # Encryption API calls
│   │   │   └── historyService.ts     # History API calls
│   │   └── store/                    # Zustand state management
│   │       └── index.ts
│   ├── e2e/                          # Playwright E2E tests
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml                # Multi-service orchestration
├── .gitignore
└── README.md
```

---

## API Reference

Base URL: `http://localhost:8000/api/v1`

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Application health status |

### BB84 Protocol

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/bb84/simulate` | Run a BB84 simulation |
| `GET` | `/bb84/presets` | Get preset configurations |

**POST `/bb84/simulate` — Request Body:**
```json
{
  "n_qubits": 12,
  "bases": ["Z", "X"],
  "eve_attack": false,
  "eve_intercept_ratio": 0.5,
  "shots": 1024
}
```

**Response:**
```json
{
  "alice_bits": [0, 1, 1, 0, ...],
  "alice_bases": ["Z", "X", "Z", "X", ...],
  "bob_bases": ["Z", "Z", "X", "X", ...],
  "bob_measurements": [0, 0, 1, 0, ...],
  "sifted_alice_key": [0, 0],
  "sifted_bob_key": [0, 0],
  "qber": 0.0,
  "is_secure": true,
  "circuit_json": { ... },
  "execution_time_ms": 245.3
}
```

### E91 Protocol

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/e91/simulate` | Run an E91 simulation |

**POST `/e91/simulate` — Request Body:**
```json
{
  "n_pairs": 9,
  "alice_angles": [0, 45, 90],
  "bob_angles": [45, 90, 135],
  "eve_attack": false,
  "noise_level": 0.0,
  "shots": 1024
}
```

**Response:**
```json
{
  "sifted_alice_key": [1, 0, 1],
  "sifted_bob_key": [1, 0, 1],
  "chsh_result": {
    "s_parameter": 2.7284,
    "correlations": { ... },
    "is_violation": true
  },
  "is_secure": true,
  "circuit_json": { ... },
  "execution_time_ms": 312.7
}
```

### Encryption

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/crypto/encrypt` | Encrypt a message with AES |
| `POST` | `/crypto/decrypt` | Decrypt a ciphertext with AES |
| `POST` | `/crypto/amplify` | Privacy amplification for short keys |
| `GET` | `/crypto/secure-length` | Check minimum secure key length |

**POST `/crypto/encrypt` — Request Body:**
```json
{
  "key_bits": [1, 0, 1, 1, 0, 0, 1, 0, ...],
  "plaintext": "Hello, quantum world!",
  "key_size": 256
}
```

**Response:**
```json
{
  "ciphertext": "base64-encoded-ciphertext",
  "iv": "base64-encoded-iv",
  "algorithm": "AES-256-CBC",
  "key_hash": "sha256-hash-first-8-chars",
  "key_bits_used": 256
}
```

### History

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/history` | List simulations (paginated, filterable) |
| `GET` | `/history/{id}` | Get simulation details |
| `PATCH` | `/history/{id}` | Update simulation label |
| `DELETE` | `/history/{id}` | Delete a simulation |
| `GET` | `/history/compare/{id1}/{id2}` | Compare two simulations |

**GET `/history` — Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `protocol` | string | - | Filter by `BB84` or `E91` |
| `eve_present` | boolean | - | Filter by Eve attack |
| `is_secure` | boolean | - | Filter by security status |
| `skip` | integer | 0 | Pagination offset |
| `limit` | integer | 20 | Items per page |

Full interactive API documentation is available at http://localhost:8000/docs after starting the backend.

---

## How It Works

### BB84 Protocol Flow

```
Alice                          Channel                         Bob
  |                              |                              |
  |  1. Generate random bits     |                              |
  |     and random bases (Z/X/D) |                              |
  |                              |                              |
  |  2. Encode qubits using      |                              |
  |     chosen bases             |                              |
  |  ────── Send qubits ──────> |  ────── Qubits ──────────>  |
  |                              |                              |
  |                              |  3. Bob measures with        |
  |                              |     random bases             |
  |                              |                              |
  |  <──── Compare bases (public channel) ────>                |
  |                              |                              |
  |  4. Keep only matching-basis measurements (key sifting)     |
  |                              |                              |
  |  5. Sample subset to calculate QBER                        |
  |     QBER < 8.5%  →  Secure channel                        |
  |     QBER >= 8.5% →  Eavesdropper detected                 |
```

### E91 Protocol Flow

```
Source                    Alice                         Bob
  |                        |                             |
  | 1. Generate EPR pairs  |                             |
  |    (Bell states |Φ+⟩)  |                             |
  |                        |                             |
  | ── Qubit A ──────────> |                             |
  | ── Qubit B ──────────────────────────────────────>  |
  |                        |                             |
  |   2. Measure at        |   3. Measure at             |
  |      angles: 0°,45°,90°|      angles: 45°,90°,135°  |
  |                        |                             |
  |   <──── Compare measurement angles (public) ────>   |
  |                        |                             |
  |   4. Calculate CHSH S-parameter from correlations    |
  |      S > 2    →  Quantum entanglement confirmed     |
  |      S ≤ 2    →  Classical behavior (compromised)    |
  |                        |                             |
  |   5. Extract key from matching-angle measurements    |
```

### AES Encryption Flow

```
Quantum Key (bits) → SHA-256 Hash → AES Key (128/192/256 bit)
                                          ↓
Plaintext + AES Key + Random IV → AES-CBC Encrypt → Ciphertext (Base64)
```

---

## Security Thresholds

| Protocol | Metric | Secure | Warning | Compromised |
|----------|--------|--------|---------|-------------|
| **BB84** | QBER (Quantum Bit Error Rate) | < 5% | 5% – 8.5% | > 8.5% |
| **E91** | CHSH S-parameter | > 2.5 | 2.0 – 2.5 | ≤ 2.0 |

- **BB84**: The 8.5% QBER threshold is derived from the theoretical maximum error introduced by an intercept-resend attack
- **E91**: The CHSH classical bound is S = 2; quantum mechanics allows up to S = 2√2 ≈ 2.828

---

## Running Tests

### Backend Tests

```bash
cd backend

# Activate virtual environment
.\venv\Scripts\activate   # Windows
source venv/bin/activate   # Linux/macOS

# Run all tests with coverage
pytest tests/ -v --cov=app

# Run only unit tests
pytest tests/unit/ -v

# Run only integration tests
pytest tests/integration/ -v
```

### Frontend Tests

```bash
cd frontend

# Unit tests (Vitest + Testing Library)
npm run test

# Unit tests in watch mode
npm run test:watch

# Unit tests with coverage
npm run test:coverage

# E2E tests (Playwright) — requires both backend and frontend running
npx playwright install    # First time only
npx playwright test
```

### Type Checking

```bash
# Frontend TypeScript check
cd frontend
npx tsc --noEmit

# Frontend build (includes type check)
npm run build
```

---

## Database

### SQLite (Default — Zero Configuration)

By default, the backend uses SQLite. A file named `qkd_simulator.db` is automatically created in the `backend/` directory on first run. No setup required.

### PostgreSQL (Production)

For production use, configure PostgreSQL:

1. Set the `DATABASE_URL` environment variable:
   ```env
   DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/qkd_simulator
   ```

2. Or use Docker Compose which includes PostgreSQL:
   ```bash
   docker-compose up --build
   ```

### Database Migrations (Alembic)

```bash
cd backend

# Create a new migration after model changes
alembic revision --autogenerate -m "description"

# Apply all pending migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

### Redis Cache (Optional)

Redis is used for caching simulation results. If Redis is not available, the application falls back to an in-memory cache automatically.

```env
REDIS_URL=redis://localhost:6379
```

---

## Troubleshooting

### Backend won't start

**Error: `ModuleNotFoundError: No module named 'qiskit'`**
```bash
# Make sure virtual environment is activated
.\venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

**Error: `Address already in use`**
```bash
# Kill the process on port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <pid> /F

# Linux/macOS:
lsof -ti:8000 | xargs kill -9
```

### Frontend won't start

**Error: `ENOENT: no such file or directory, open '.../node_modules/...'`**
```bash
# Clear and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Error: `TypeError: fetch failed` or API calls failing**
- Make sure the backend is running on port 8000
- Check `frontend/.env` has `VITE_API_URL=http://localhost:8000`
- Check CORS origins in `backend/.env` include `http://localhost:5173`

### Docker issues

**Error: `port is already allocated`**
```bash
# Stop existing containers
docker-compose down
# Or change ports in docker-compose.yml
```

**Rebuilding after code changes:**
```bash
docker-compose up --build
```

### Qiskit simulation errors

**Error: `No module named 'qiskit_aer'`**
```bash
pip install qiskit-aer>=0.13.0
```

**Slow simulation times:**
- Reduce the number of shots (default: 1024)
- Use fewer qubits/pairs for faster results

---

## References

- [BB84 Protocol — Bennett & Brassard (1984)](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.68.557)
- [E91 Protocol — Ekert (1991)](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.67.661)
- [CHSH Inequality — Wikipedia](https://en.wikipedia.org/wiki/CHSH_inequality)
- [Qiskit Documentation](https://qiskit.org/documentation/)
- [Qiskit Aer Simulator](https://qiskit.github.io/qiskit-aer/)
- [NIST Post-Quantum Cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography)

---

## License

MIT License — See [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with Qiskit Quantum Computing Framework
</p>
