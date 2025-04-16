
# Student Management System Documentation

This file contains comprehensive documentation for the Student Management System. For detailed information about each section, please refer to the full documentation sections below:

## Table of Contents
1. [Scope of System](#scope-of-system)
2. [Operating Environment](#operating-environment)
3. [Technology Stack](#technology-stack)
4. [System Components](#system-components)
5. [Database Design](#database-design)
6. [API Documentation](#api-documentation)
7. [Testing Strategy](#testing-strategy)

## Scope of System
[Content as provided in the documentation...]

## Operating Environment
[Content as provided in the documentation...]

## Technology Stack
[Content as provided in the documentation...]

## Entity Relationship Diagram
The following represents the ER diagram in traditional notation style:

```mermaid
erDiagram
    USERS ||--o{ STUDENTS : has
    USERS {
        uuid id PK
        string email
        string full_name
        string role
        boolean is_first_login
        boolean is_active
        timestamp last_login
    }
    
    STUDENTS ||--o{ STUDENT_COURSE_ENROLLMENTS : has
    STUDENTS {
        uuid id PK
        uuid user_id FK
        string enrollment_number
        date date_of_birth
        date enrollment_date
        string enrollment_status
        string contact_number
        string address
        string guardian_name
        string guardian_contact
        string fee_status
        numeric total_fees_due
        numeric total_fees_paid
    }

    COURSES ||--o{ STUDENT_COURSE_ENROLLMENTS : has
    COURSES {
        uuid id PK
        string name
        string code
        string description
        integer credits
        string duration
        boolean is_active
    }

    STUDENT_COURSE_ENROLLMENTS {
        uuid id PK
        uuid student_id FK
        uuid course_id FK
        string status
        string academic_year
        integer semester
        string admin_remarks
    }

    STUDENTS ||--o{ PAYMENT_TRANSACTIONS : makes
    FEE_STRUCTURES ||--o{ PAYMENT_TRANSACTIONS : applies_to
    FEE_STRUCTURES {
        uuid id PK
        string fee_type
        numeric amount
        string academic_year
        integer semester
        uuid course_id FK
        boolean is_active
    }

    PAYMENT_TRANSACTIONS {
        uuid id PK
        uuid student_id FK
        uuid fee_structure_id FK
        numeric amount
        timestamp payment_date
        string payment_method
        string status
        string receipt_number
        string transaction_id
        string admin_remarks
    }

    STUDENTS ||--o{ ATTENDANCE_RECORDS : has
    ATTENDANCE_RECORDS {
        uuid id PK
        uuid student_id FK
        uuid class_id FK
        uuid teacher_id FK
        uuid subject_id FK
        date date
        string status
        string remarks
    }

    STUDENTS ||--o{ STUDENT_NOTIFICATIONS : receives
    STUDENT_NOTIFICATIONS {
        uuid id PK
        uuid student_id FK
        string title
        string message
        boolean is_read
    }

    STUDENTS ||--o{ ASSIGNMENT_SUBMISSIONS : submits
    ASSIGNMENT_SUBMISSIONS {
        uuid id PK
        uuid student_id FK
        uuid assignment_id FK
        string file_path
        string file_name
        string submission_text
        timestamp submitted_at
        string status
        integer score
        string feedback
    }
```

Note: For clarity and simplicity, this diagram focuses on the core student-related entities and their relationships. Additional entities and relationships exist in the complete system.

## API Documentation
[Content as provided in the documentation...]

## Testing Strategy
[Content as provided in the documentation...]

For complete implementation details, please refer to the individual component documentation and codebase.
