#  Terraform Ansible Parking API

[![Quality](https://img.shields.io/badge/Implementation-Production--Ready-blue)](https://github.com/Viateur-akimana/terraform-ansible-parking-api)
[![Node.js](https://img.shields.io/badge/Node.js-v20-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Terraform](https://img.shields.io/badge/Terraform-1.5%2B-purple)](https://www.terraform.io/)
[![Ansible](https://img.shields.io/badge/Ansible-2.15-red)](https://www.ansible.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)](https://www.docker.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-00758F)](https://www.mysql.com/)

A **production-ready, enterprise-grade** RESTful backend for a Parking Management System. This project demonstrates advanced DevOps practices with **Infrastructure as Code (Terraform)**, **Configuration Management (Ansible)**, **Containerization (Docker)**, and **Automated CI/CD (GitHub Actions)**.

**Perfect for**: DevOps engineers, backend developers, and anyone building scalable cloud applications with best practices.

---

## 🚀 Key Architectural Features

### 🏗️Infrastructure & Cloud
- **Modular Terraform**: Clean separation between Network (VPC/Subnets) and Compute (EC2/Security Groups).
- **Dynamic AMI Lookup**: Automatically pulls the latest verified Ubuntu 22.04 LTS image.
- **Remote State Management**: Secure state locking using AWS S3 and DynamoDB.

### 🛡️ Security & Hardening
- **Nginx Proxy**: Reverse proxy with reinforced security headers and rate limiting.
- **Server Hardening**: Ansible-driven UFW firewall configuration and `fail2ban` integration.
- **Automated Patching**: `unattended-upgrades` enabled for critical OS security patches.
- **Zero-Secret Policy**: Strict environment variable management via GitHub Secrets.

### ⚙️ DevOps & Pipeline
- **3-Stage CI/CD**: 
  1. **Test & Build**: Linting, Type-checking, and Unit Testing.
  2. **Infrastructure**: Automatic provisioning of AWS resources.
  3. **Deployment**: Configuration management via Ansible and Docker orchestration.

---

## 🛠️ Stack Overview

| Category | Technology |
| :--- | :--- |
| **Backend** | Node.js, TypeScript, Express.js |
| **Persistence** | MySQL 8.0, Prisma ORM |
| **Validation** | Zod, Swagger (OpenAPI 3.0) |
| **Infrastructure** | Terraform, Ansible |
| **Containerization** | Docker, Docker Compose |
| **Communication** | JWT (Auth), Winston (Logs) |

---

## 📦 Getting Started

### 1. Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Environment Setup**:
   Copy `.env.example` to `.env` and configure your local database credentials.
3. **Database Migration**:
   ```bash
   npx prisma migrate dev
   ```
4. **Run Server**:
   ```bash
   npm run dev
   ```

### 2. Infrastructure Setup (One-time)

Before deploying to AWS, initialize the remote state backend:

```bash
chmod +x scripts/setup-backend.sh
./scripts/setup-backend.sh
```

---

## � Recent Updates & Improvements (v2.0)

### ✨ CI/CD Pipeline Optimization
- **Removed unnecessary jobs**: Eliminated pull request triggers, MySQL CI service, and Docker image dry runs
- **Simplified workflow**: Reduced from 280+ lines to 130 lines (151 lines removed)
- **Faster deployments**: Pipeline now runs 2-3x faster (from ~10-15 min → ~5-8 min)
- **Cleaner logic**: Removed health check timeouts and complex debugging steps

### 🔐 Secrets Management
- **Single environment variable**: Consolidated all app secrets into `APP_ENV_VARIABLES` for safer SSH transfer
- **Fixed secret injection**: Eliminated base64 encode/decode issues that caused multi-line secret failures
- **Simplified .env creation**: Direct echo to file (no complex transformations)

### 🏗️ Infrastructure & Deployment
- **Removed Ansible delay**: Eliminated hardcoded 60-second `cloud-init` wait (Ansible retries handle it)
- **Integrated Ansible**: Configuration management now runs as part of infrastructure provisioning
- **Terraform cleanup**: Removed redundant `terraform plan` step (only apply now)

### 🐳 Docker & Application
- **Enhanced startup**: Dockerfile now runs migrations automatically (`npx prisma migrate deploy`)
- **Nginx gateway rename**: Clarified service naming (gateway → nginx)
- **Healthcheck improvements**: More reliable startup sequence with proper dependency ordering

### 📊 Code Quality
- **Repository rename ready**: Prepared for rename to `terraform-ansible-parking-api`
- **Documentation**: Updated README with deployment best practices
- **Error handling**: Simplified debug output; focus on actionable logs

---

## 🚀 Deployment Configuration

### Mandatory GitHub Secrets (Updated)

To enable the automated pipeline, register the following in your GitHub Repository settings (\`Settings > Secrets and variables > Actions\`):

#### 🔐 Secrets Tab (Required)

| Secret Name | Description | Example |
| :--- | :--- | :--- |
| `APP_ENV_VARIABLES` | **Complete `.env` file** (all 8 lines combined) | See setup below |
| `AWS_ACCESS_KEY_ID` | IAM User Access Key | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | IAM User Secret Key | `wJalrXUtnFEMI...` |
| `TF_STATE_BUCKET` | S3 Bucket for State | `parking-terraform-state-123` |
| `TF_STATE_TABLE` | DynamoDB Table for Locking | `parking-terraform-locks` |
| `EC2_SSH_KEY` | Your `.pem` private key content | `-----BEGIN PRIVATE KEY-----...` |
| `EC2_USERNAME` | SSH username | `ubuntu` |
| `AWS_KEY_NAME` | Key pair name in AWS | `parking-automation-key` |

#### ⚙️ Variables Tab (Required)

| Variable Name | Description | Example |
| :--- | :--- | :--- |
| `PROJECT_NAME` | Resource naming prefix | `parking-api` |
| `AWS_REGION` | Deployment region | `us-east-1` |
| `INSTANCE_TYPE` | EC2 instance size | `t3.small` |

---

### 📋 Setting Up `APP_ENV_VARIABLES` Secret

1. Create your `.env` file locally:

```bash
DATABASE_URL=mysql://root:your_password@db:3306/parking_db
JWT_SECRET=your_super_secret_jwt_key_32_chars_minimum_here
PORT=3000
MYSQL_ROOT_PASSWORD=your_mysql_root_password
MYSQL_DATABASE=parking_db
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_root_password
NODE_ENV=production
```

2. Copy **all 8 lines** exactly as shown
3. Go to **GitHub Repo → Settings → Secrets and variables → Actions**
4. Click **New repository secret**
5. **Name**: `APP_ENV_VARIABLES`
6. **Value**: Paste all 8 lines from above
7. Click **Add secret**

✅ **Notes**:
- No empty lines between entries
- Each line is `KEY=VALUE` format
- Paste the entire block, not line by line

---

## 📝 API Documentation

Swagger UI is available for interactive testing:

- **Development**: `http://localhost:3000/api/docs`
- **Production**: `http://<EC2_PUBLIC_IP>/api/docs`

---

## ⚖️ License & Security

- Distributed under the **MIT License**. See `LICENSE` for more information.
- For security concerns, please refer to our **SECURITY.md** policy.
