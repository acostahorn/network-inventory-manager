AAA Network Solutions Inventory & Design Workspace

A full-stack network asset inventory management system and interactive topology designer built to streamline data-center asset allocation, warehouse inventory control, and visual network planning.
 Key Architectural Features

    Visual Canvas Interface: Drag-and-drop network topology area tied directly to underlying asset inventory specifications.

    Server-Side Pagination: Optimized performance with cursor-limited data streaming (10 items per chunk) to scale seamlessly from 15 items to 15,000+.

    State-Preserving Search & Filtering: Dynamic pipeline combining full-text search matching and category dropdown filters that persist perfectly across pagination indices.

    Single Source of Truth Design: Architecture decoupled from rigid string dependencies, routing both backend Mongoose schemas and frontend Canvas layout operations through a unified central configuration file.

 Tech Stack
Component	Technology
Backend	Node.js, Express.js
Database	MongoDB, Mongoose ODM
Frontend UI	EJS, Bootstrap 5, Native HTML5 Canvas
 Release Notes: v1.5.0 (June 2, 2026)

This release shifts the codebase from "vibecoding" technical debt toward a highly scalable, robust MVC architecture.
Architectural & Data Pipeline Overhauls

    Decoupled Configuration Management: Eliminated redundant, hardcoded category arrays across 5 separate locations. Replaced with a unified data bridge originating from a single module (utils/categories.js).

    Cross-Environment Data Bridging: Implemented an explicit EJS-to-Browser global window string layout pipeline (window.SYSTEM_CATEGORIES), ensuring client-side scripts remain synchronized with backend schema changes.

UX & Interface Engineering

    Advanced State-Preserved Pagination: Deployed an adaptive pagination bar that ensures routing flags (search and category) persist continuously while shifting between active document frames.

    Contextual Exception Handling: Added a user-facing empty-state banner to intercept negative search footprints (where query results equal 0), replacing empty tables with clean layout-recovery prompts.

Bug Fixes & Hotfixes

    Database Index Alignment: Resolved a critical grid-rendering error on the topology canvas caused by mismatched data collection indices.

    Data Integrity Correction: Repaired anomalous inventory categorization logs—such as hardware assets improperly flagged during schema modifications—via granular administrative CRUD dashboards.
