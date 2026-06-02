# AAA Network Solutions Inventory & Design Workspace

A full-stack network asset inventory management system and interactive topology designer built to streamline data-center asset allocation, warehouse inventory control, and visual network planning.

## Key Architectural Features

* **Visual Canvas Interface:** Drag-and-drop network topology area tied directly to underlying asset inventory specifications.
* **Server-Side Pagination:** Optimized performance with cursor-limited data streaming ($10$ items per chunk) to scale seamlessly from 15 items to 15,000+.
* **State-Preserving Search & Filtering:** Dynamic pipeline combining full-text search matching and category dropdown filters that persist perfectly across pagination indices.
* **Single Source of Truth Design:** Architecture decoupled from rigid string dependencies, routing both backend Mongoose schemas and frontend Canvas layout operations through a unified central configuration file.

## Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose ODM
* **Frontend UI:** EJS (Embedded JavaScript), Bootstrap 5, Native HTML5 Canvas

---

## Release Notes: Version 1.5.0 (June 2, 2026)

This release focuses heavily on systemic refactoring, moving the codebase away from technical debt ("vibecoding") and transforming it into a highly scalable, robust MVC application architecture.

###  Architectural & Data Pipeline Overhauls
* **Decoupled Configuration Management:** Eliminated redundant, hardcoded category arrays across 5 separate locations (`index.js`, route handlers, data controllers, and frontend DOM engines). Replaced with a unified data bridge originating from a single module (`utils/categories.js`).
* **Cross-Environment Data Bridging:** Implemented an explicit EJS-to-Browser global window string layout pipeline (`window.SYSTEM_CATEGORIES`), allowing client-side asset scripts to dynamically stay synchronized with changes to the backend schema.

### UX & Interface Engineering
* **Advanced State-Preserved Pagination Controls:** Deployed an adaptive pagination bar matching custom database lookups, engineering the routing flags (`search` and `category`) to persist continuously while shifting between active document frames.
* **Conditional Search Exception Handling:** Added a user-facing contextual empty-state banner to intercept negative search footprints (e.g., matching database queries resulting in `.length === 0`), replacing uninformative empty tables with clean layout-recovery prompts.

### Bug Fixes & Hotfixes
* **Database Index Alignment:** Resolved a critical grid-rendering error on the topology canvas caused by mismatched data collection indices. 
* **Data Integrity Correction:** Repaired anomalous inventory categorization logs (e.g., hardware assets improperly flagged during schema modifications) safely via granular administrative CRUD dashboards.