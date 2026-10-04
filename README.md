#  Award & Voting Management System

**Web-Based Award Nomination and Voting System Project**

Welcome to the **AwardPulse** project repository. This is a full-stack web application designed to streamline the award nomination, voting, judging, and winner verification process securely and efficiently.

The system integrates multiple distinct modules to provide a seamless platform for Administrators, Judges, and Voters.

---

## Project Overview & Tech Stack

- **Frontend:** React, HTML, Tailwind CSS[cite: 1]
- **Backend:** Node.js, Express.js[cite: 1]
- **Database:** Microsoft SQL Server[cite: 1]

---

## Core Features & Architecture

- **Authentication & Authorization:** JWT authentication supporting Admin, Voter, and Judge roles[cite: 1].
- **Category Management:** Full CRUD operations for award categories with Open Date and Close Date validations[cite: 1].
- **Nominee Management:** CRUD operations for nominees with status tracking and image support[cite: 1].
- **Judge Management:** Secure Judge CRUD operations utilizing bcrypt password hashing[cite: 1].
- **Voting System:** Vote creation, read/audit trails, and single-vote-per-category enforcement with server-side window validation[cite: 1].
- **Concurrency Control:** Atomic duplicate-vote protection using SQL Server application locks[cite: 1].
- **Evaluations:** Judge evaluation CRUD with 1-10 scoring validation and per-judge duplicate protection[cite: 1].
- **Ranking & Analytics:** Vote totals, judge score averages, and deterministic ranking calculations[cite: 1].
- **Design Patterns:** 
  - *Strategy Pattern* for flexible ranking calculations[cite: 1].
  - *Factory Pattern* for selecting ranking strategies[cite: 1].
  - *Decorator Pattern* for audited notifications[cite: 1].
- **Winner Verification:** Tie detection, manual winner verification, and winner lifecycle management through award records[cite: 1].

---

## Team & Workload Distribution


| Module | Contributor Email | Assigned Features & Responsibilities |
| :--- | :--- | :--- |
| **Authentication & User Management** | `it25100015@my.sliit.lk` | JWT authentication flow, role-based authorization (Admin/Judge/Voter), password hashing, and user profile management. |
| **Category & Nominee Management** | `it25100234@my.sliit.lk` | Category CRUD operations, opening/closing date validations, nominee registration, status tracking, and image handling. |
| **Voting & Concurrency Control** | `it25100618@my.sliit.lk` | Vote submission, single-vote-per-category enforcement, server-side window validation, and SQL Server application locks for duplicate protection. |
| **Evaluation, Ranking & Winner Module** | `it25100999@my.sliit.lk` | Judge evaluation CRUD, scoring validation (1-10), Strategy/Factory pattern implementation for ranking, tie detection, and winner verification. |

---

## Getting Started & Running the Project

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
