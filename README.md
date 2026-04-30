# EduControl

EduControl is a classroom management system inspired by NetSupport School.
The project provides real-time communication and classroom control features for tutors, students, and administrators.

This repository also includes a Selenium automation testing framework built using Java, Selenium WebDriver, TestNG, Maven, and Allure Reports.

---

# Project Features

## Tutor Dashboard

* Student monitoring dashboard
* Broadcast messages
* Lock student screens
* Blank student screens
* Student grid with live status
* Chat system
* Quiz management
* Individual student controls

---

## Student View

* Receive tutor commands
* Receive broadcast messages
* Real-time chat with tutor
* Quiz participation
* Live status updates

---

## Admin Panel

* Statistics overview
* Student management
* Class management
* Session logs

---

## Real-Time Features

* WebSocket-based communication
* Live status updates
* Live chat system
* Real-time quiz interactions

---

# Technologies Used

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

## Backend

* Python
* FastAPI
* WebSockets

## Automation Testing

* Java
* Selenium WebDriver
* TestNG
* Maven
* Allure Reports

---

# Login Credentials

| Role    | Email                                       | Password    |
| ------- | ------------------------------------------- | ----------- |
| Tutor   | [tutor@edu.com](mailto:tutor@edu.com)       | password123 |
| Admin   | [admin@edu.com](mailto:admin@edu.com)       | password123 |
| Student | [student1@edu.com](mailto:student1@edu.com) | password123 |

---

# Project Setup

## 1. Clone Repository

```bash
git clone https://github.com/doniaesam530/Net-support-school.git
```

---

# Backend Setup

Open terminal inside:

```bash
backend
```

Install dependencies:

```bash
pip install fastapi uvicorn websockets pydantic
```

Run backend server:

```bash
uvicorn main:app --reload --port 8000
```

Backend runs on:

```bash
http://localhost:8000
```

---

# Frontend Setup

Open another terminal inside:

```bash
frontend
```

Install dependencies:

```bash
npm install
```

Run frontend:

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# Automation Testing Setup

Open terminal inside:

```bash
automation-framework
```

Run automated login test suite:

```bash
mvn test -Dtest=LoginTest
```

---

# Generate Allure Report

After running tests:

```bash
allure serve allure-results
```

---

# Automated Test Scenarios

The current Selenium automation framework includes automated authentication scenarios:

* Valid Tutor Login
* Valid Admin Login
* Invalid Login Validation

The framework follows:

* Page Object Model (POM)
* Reusable Base Test structure
* Selenium WebDriver best practices
* TestNG execution structure

---

# Documentation

Project documentation is available inside the `documentation` folder:

* Manual Test Cases
* Allure Report Screenshots
* Automation Report PDF

---

# Demo Video

Automation testing demo video:

https://drive.google.com/drive/u/0/folders/1B4f8GQRmFfNgvHe4vnUToSj-oioMlQ5a

---

# Notes

The automation framework currently focuses on core authentication workflows as a sample implementation of the testing architecture and framework structure.

The project can be extended further to automate:

* Tutor dashboard interactions
* Quiz workflows
* Chat system
* Student actions
* Real-time features
Academic Project Information

This project was developed as part of a university coursework project.

# Academic Project Information

This project was developed as part of a university coursework project.

* University: Zagazig University
* Faculty: Faculty of Engineering
* Department: Computer Engineering

## Team Members

* Aml Hesham
* Ayten Zordok
* Donia Essam
* Hager AbdElazeem
* Kholoud Waleed
* Mariam Othman
* Merna Atef
* Nora AbdElbaseet
* Tassneem Amin

## Automation Testing Contribution

Selenium automation framework and automated authentication test scenarios were implemented using:

* Java
* Selenium WebDriver
* TestNG
* Maven
* Allure Reports
