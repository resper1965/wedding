# 🎼 Security Alignment Plan: OWASP & Transparency

This plan details the orchestration of security-auditor, frontend-specialist, and devops-engineer to bring MarryFlow into alignment with OWASP Top 10, modern disclosure standards, and a "TrustCenter" experience.

## 🔴 User Review Required
> [!IMPORTANT]
> This plan introduces a public-facing Security TrustCenter and a standardized vulnerability disclosure file (`security.txt`). These are critical for professional transparency.

## Proposed Changes

### 🛡️ Core Security (OWASP Top 10 Alignment) [@security-auditor]
- **Broken Access Control**: Audit all API routes in `src/app/api` to ensure `verifySupabaseToken` and `verifyTenantAccess` are strictly enforced. [@security-auditor]
- **Cryptographic Failures**: Ensure HSTS is strictly enforced with `includeSubDomains` and `preload` in `next.config.ts`. [@security-auditor]
- **Injection (XSS)**: Implement a custom sanitization hook for user-generated content (GUEST names, notes) using `dompurify`. [@frontend-specialist]

### 📄 Transparency & Disclosure [@devops-engineer]
- **[NEW] [security.txt](file:///home/wedding/public/.well-known/security.txt)**: Standardized RFC 9116 file for vulnerability reporting.
- **[NEW] [security.br.txt](file:///home/wedding/public/.well-known/security.br.txt)**: Portuguese version of the security disclosure policy for Brazilian compliance.

### ✨ TrustCenter UI/UX [@frontend-specialist]
- **[NEW] [trustcenter/page.tsx](file:///home/wedding/src/app/trustcenter/page.tsx)**: A premium "Executive Wellness" page explaining:
  - Data Residency (Supabase/Firebase)
  - Encryption Standards (AES-256)
  - Compliance (ISO 27001/27701)
  - Audit Trail & Transparency

---

## Verification Plan

### Automated Checks
- **OWASP Scan**: Run `.agent/skills/vulnerability-scanner/scripts/security_scan.py .`
- **Lint & Types**: Run `.agent/skills/lint-and-validate/scripts/lint_runner.py .`
- **Header Audit**: Verify HSTS and Permissions-Policy via `verify_ssdlc.py`.

### Manual Verification
- Access `/.well-known/security.txt` and verify RFC 9116 compliance.
- Review the TrustCenter UI for "Executive Wellness" aesthetic alignment.
- Verify that non-authenticated users cannot access guest data via direct API calls.
