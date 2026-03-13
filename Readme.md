# Technical Overview: Modern Healthcare Management System (HMS)

##  Summary
This Healthcare Management System is a premium, enterprise-grade platform built on **Java 21 (LTS)** and **Spring Boot 4.0.3**. It features a decoupled, stateless architecture designed for high availability and security. By leveraging **React 19** and **Tailwind CSS 4**, the system delivers a modern, high-performance user experience with a focus on **security-by-design** and **clinical auditability**.

---

## 🏗️ System Architecture & Request Lifecycle

The system follows a **strictly layered monolithic architecture** with a clear separation of concerns, ensuring high maintainability and testability.



### The Request Lifecycle
1.  **Interception**: Every request is intercepted by the `JwtAuthenticationFilter`, which extracts and validates the Bearer token using the **JJWT** library.
2.  **Authentication**: If valid, the `SecurityContextHolder` is populated with the user's principle and authorities (Roles).
3.  **Controller Entry**: The request enters the `@RestController`. Input data is automatically validated using `jakarta.validation` (`@Valid`).
4.  **Service Orchestration**: Controllers delegate to `@Service` components where business rules (e.g., appointment slot availability checking) are enforced.
5.  **Audit Persistence**: When a service saves an entity via the `Repository`, the `AuditConfig` automatically injects the `CreatedBy` and `LastModifiedBy` fields before the transaction commits to the database.
6.  **Response Transformation**: Entities are mapped back to DTOs to ensure internal database structures are never exposed to the client.

### 1. 100% Stateless Scalability
Unlike traditional HMS platforms that rely on server-side sessions, this system is completely stateless. This allows for horizontal scaling across Kubernetes clusters or multi-region deployments without session synchronization overhead.

### 2. Advanced JJWT Implementation
Utilizing the strictly latest **JJWT 0.12.5** API, the system implements modern cryptographic standards for token signing and verification, ensuring robust protection against token tampering.

### 3. Integrated Audit Engine
Accountability is baked into the database layer. Using **Spring Data JPA AuditorAware**, every clinical record (prescriptions, EHR updates) is automatically stamped with the exact User ID and Timestamp of the modifier, creating a non-repudiable audit trail.

### 4. Hybrid Profile System
The system uses a unique normalized model where the `User` entity handles authentication/RBAC, while specialized profiles (`PatientProfile`, `DoctorProfile`, etc.) manage domain-specific data. This maximizes query performance while maintaining strict data separation.

---

## ⚙️ Feature Ecosystem

### 🏛️ Administrative Excellence
- **Unified User Management**: Full CRUD on all system roles (Admin, Doctor, Patient, Receptionist).
- **Departmental Hierarchy**: Manage hospital departments and organizational structure.
- **Enterprise Pharmacy**: Real-time inventory tracking with low-stock alerting and price management.

### 👨‍⚕️ Clinical Orchestration
- **EHR Suite**: Secure Electronic Health Records tracking patient history, allergies, and chronic conditions.
- **Dynamic Prescription Engine**: Doctors can link multi-drug prescriptions directly to appointment IDs.
- **Appointment Lifecycle**: Real-time status tracking from "Pending" to "Completed" with zero-overlap slot management.

### 🏥 Patient Experience
- **Digital Health Passport**: Patients can view their entire medical history, current prescriptions, and billing status in real-time.
- **Automated Scheduling**: Streamlined workflow for finding doctors and booking available slots.

### 💳 Financial Operations
- **Automated Invoicing**: Integration between clinical data and billing. Medial costs are calculated dynamically based on prescriptions and consult fees.
- **Status Tracking**: Real-time monitoring of bill payment status (Paid, Unpaid, Partially Paid).

---

## 🛠️ Technical Specifications

> **Minimalist & Modern**: The project avoids legacy "fat" frameworks, opting for lightweight, high-performance modern alternatives.

| Component | Technology | Version  |
| :--- | :--- |:---------|
| **Language** | Java | 21 (LTS) |
| **Framework** | Spring Boot | 4.0.3    |
| **Security** | Spring Security | 6.x      |
| **Database** | PostgreSQL | 17       |
| **Auth** | JJWT | 0.12.5   |
| **Frontend** | React | 19.0.0   |
| **Styling** | Tailwind CSS | 4.0.0    |
| **Build** | Vite / Maven | Latest   |

---

## 🎨 Design Aesthetics
- **Glassmorphism**: Elegant translucent UI components for a premium feel.
- **Micro-animations**: Smooth transitions (0.3s - 0.5s) for all interactions.
- **Responsive Layout**: Seamless experience across mobile, tablet, and desktop.
- **Role-specific Interfaces**: Unique sidebar and dashboard schemes for each user type.
