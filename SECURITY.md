# Security Policy

## SSDLC (Secure Software Development Life Cycle)

MarryFlow follows a strict **Secure SDLC** process to ensure the privacy and integrity of our wedding concierge platform.

### 1. Development Principles
- **Least Privilege**: All API access is scoped to the minimum required permissions.
- **Zero Trust**: Every request is authenticated and authorized via JWT/Session.
- **Fail-Secure**: All security failures result in access denial.

### 2. Quality Gates (SSDLC)
Before any code is merged into `main`, it must pass the following automated gates:
- **SAST**: Automated security scan for secrets and common vulnerabilities.
- **Lint**: Strict code style and formatting checks.
- **Type Safety**: Minimum 90% TypeScript coverage.
- **Tests**: 100% pass rate for unit and integration tests.

### 3. Vulnerability Reporting
If you find a security vulnerability, please do NOT open a public issue. Instead, report it to:
**security@marryflow.com**

We aim to acknowledge all reports within 24 hours and provide a fix within 7 days for critical issues.

### 4. Supply Chain Security
All dependencies are audited weekly using `dependency_analyzer.py` and pinned to specific versions in `package-lock.json`.
