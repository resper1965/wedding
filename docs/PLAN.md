# PR #1 Review & Implementation Plan

This plan was generated during Phase 1 of the `[/orchestrate]` workflow.

## 1. Goal Description
The objective is to fix the build errors introduced in PR #1 (migrating from Prisma to Supabase JS SDK) and successfully deploy the application. 

Currently, `npm run build` fails with two target module export errors:
1. `src/app/api/email/send/route.ts`: Fails to import `EmailService`.
2. `src/app/api/weather/route.ts`: Fails to import `WeatherService`.

## 2. Proposed Changes

### Build Fixes Configuration

#### [MODIFY] src/app/api/email/send/route.ts
- Change `import { EmailService }` to `import { emailService }`.
- Remove the `const emailService = new EmailService()` instantiation inside the loop, using the imported `emailService` singleton directly.

#### [MODIFY] src/app/api/weather/route.ts
- Change `import { WeatherService }` to `import { getWeatherForecast }`.
- Update the instantiation logic to directly call `getWeatherForecast(weddingDate, lat, lon)` instead of using `weatherService.getWeather()`.
- Add parsing for `weddingDate` to ensure a valid `Date` object is passed to `getWeatherForecast`.

## 3. Verification Plan

### Automated Tests
- Run `npm run build` locally to verify that the TypeScript compiler successfully compiles all API routes and pages without throwing export errors.
- Run `python .agent/skills/lint-and-validate/scripts/lint_runner.py .` to ensure codebase meets linting rules. 
- Run `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .` to ensure no vulnerabilities exist.

### Manual Verification
- Deploy to Vercel/production using the `gh pr merge` and trigger Vercel deploy, or run the deployment script if applicable.
- Confirm that the errors in the GitHub PR block are resolved.
