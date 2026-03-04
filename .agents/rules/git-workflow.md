---
trigger: manual
description: Apply this rule ONLY when the task involves interacting with version control, such as staging files, writing commit messages, creating branches, or pushing code.
---

# Git Workflow & Versioning

- **Keep commits atomic and focused** (one logical change per commit).
- **Use conventional commits** (`feat:`, `fix:`, `docs:`, `refactor:`).
- **Commit messages** must be in the imperative mood and concise (<72 chars).
- **Run tests** before committing.
- **Never force-push** to `main/master` without explicit approval.