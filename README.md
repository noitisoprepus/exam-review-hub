# Exam Review Hub

## 📋 Prerequisites
Make sure to have the following installed:
- [Docker](https://www.docker.com/products/docker-desktop)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Dev Containers extension for VS Code](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- [Git](https://git-scm.com/)

## 🚀 Quick Start (For Testing & Development)

### 1. Clone Repository
```bash
git clone https://github.com/noitisoprepus/exam-review-hub.git
cd exam-review-hub
```

### 2. Open in VS Code
```bash
code .
```

### 3. Reopen in Development Container
- Open the command paletter (Ctrl+Shift+P) and run "Dev Containers: Reopen in Container"

(The Docker engine should be running for this to work)

### 4. Wait for Container Setup
- First time: 5-10 minutes (building containers + installing dependencies)
- Subsequent starts: 30-60 seconds

### 5. Start Development Services
Once container is ready, start both frontend and backend:
```bash
pnpm dev
```

### 6. Access the Services
Both frontend, api, and database services start simultaneously:
- Next.js Frontend: http://localhost:3000
- NestJS API: http://localhost:3001  
- PostgreSQL Database: localhost:5432

(Press Ctrl+C in the terminal to stop the services.)
