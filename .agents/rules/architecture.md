---
trigger: model_decision
description: Use when designing features or structuring frontend/backend code. Defines MERN/Zod stack, monorepo directories, and architecture rules.
---

# Project Context & Architecture

## 1. Project DNA

- **Tech Stack:**
  - **Frontend:** React, Vite, Tailwind CSS, Shadcn UI.
  - **State Management & API:** Redux Toolkit (RTK Query) applied strictly.
  - **Backend:** Node.js, Express.js.
  - **Database:** MongoDB with Mongoose.
  - **Validation & Typing:** Zod (shared schemas) and TypeScript.
- **Package Manager:** Yarn (Workspaces).
- **Architecture Type:** Monorepo (Client / Server REST API). Clean Architecture enforced (strict separation between Routes, Controllers, Services, and Models on the backend). Native RBAC (Role-Based Access Control) system.
- **Directory Structure:**
  - `/apps/client`: Contains the entire Frontend application (React/Vite).
  - `/apps/server` (or `@rental/server`): Contains the Backend API (Express).
  - `/packages/shared`: Contains common logic, shared TypeScript types, and Zod validation schemas used by both the client and the server.

---

## 2. Architecture Philosophy & Code Quality

- **Architectural Integrity:** Separate concerns clearly. Keep business logic isolated from delivery mechanisms. Dependencies must flow inward only (Transport → Service → Repository → Domain).
- **Respect Existing Code:** Match the style, naming conventions, and architectural patterns already present in the codebase.
- **Code & Design Quality:** Prefer explicitness over implicit behavior. Keep functions small, focused, and readable.
- **Scalability & Performance:** Always use connection pooling for production code. Prefer stateless and loosely coupled components. Measure before optimizing.
- **Strict Typing:** Use TypeScript strict mode where applicable and strictly follow the team's ESLint configuration. No unsafe types without documented justification.