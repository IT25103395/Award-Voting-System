#  Award & Voting Management System

**Web-Based Award Nomination and Voting System Project**

Welcome to the **AwardPulse** project repository. This is a full-stack web application designed to streamline the award nomination, voting, judging, and winner verification process securely and efficiently.

The system integrates multiple distinct modules to provide a seamless platform for Administrators, Judges, and Voters.

---

## Project Overview & Tech Stack

- **Frontend:** React, HTML, Tailwind
- **Backend:** Node.js, Express.js
- **Database:** Microsoft SQL Server

---


## Core Features & Architecture

- **Authentication & Authorization:** JWT authentication supporting Admin, Voter, and Judge roles.
- **Category Management:** Full CRUD operations for award categories with Open Date and Close Date validations.
- **Nominee Management:** CRUD operations for nominees with status tracking and image support.
- **Judge Management:** Secure Judge CRUD operations utilizing bcrypt password hashing.
- **Voting System:** Vote creation, read/audit trails, and single-vote-per-category enforcement with server-side window validation.
- **Concurrency Control:** Atomic duplicate-vote protection using SQL Server application locks.
- **Evaluations:** Judge evaluation CRUD with 1-10 scoring validation and per-judge duplicate protection.
- **Ranking & Analytics:** Vote totals, judge score averages, and deterministic ranking calculations.
- **Design Patterns:** 
  - *Strategy Pattern * for flexible ranking calculations.
  - *Factory Pattern * for selecting ranking strategies.
  - *Decorator Pattern * for audited notifications.
- **Winner Verification:** Tie detection, manual winner verification, and winner lifecycle management through award records.

---


## Team & Workload Distribution


| Module | Contributor Email | Assigned Features & Responsibilities |
| :--- | :--- | :--- |
| **Judge Management & Evaluate Nominees** | it25101698@my.sliit.lk | JWT authentication flow, role-based authorization (Admin/Judge/Voter), password hashing, and user profile management. |
| **Nominee Management** | it25103592@my.sliit.lk | Category CRUD operations, opening/closing date validations, nominee registration, status tracking, and image handling. |
| **Manage Award Categories** | it25100595@my.sliit.lk | Judge evaluation CRUD, scoring validation (1-10), Strategy/Factory pattern implementation for ranking, tie detection, and winner verification. |
| **Secure Voting** | it25101515@my.sliit.lk | Vote submission, single-vote-per-category enforcement, server-side window validation, and SQL Server application locks for duplicate protection. |
| **Vote Counting & Winner Selection** | it25103395@my.sliit.lk | Vote counting mechanics, score compilation, criteria evaluation, tie resolution logic, and automated/manual winner selection workflows. |
| **Results Management** | it25102508@my.sliit.lk | Judge evaluation CRUD, scoring validation (1-10), Strategy/Factory pattern implementation for ranking, tie detection, and winner verification. |


---

