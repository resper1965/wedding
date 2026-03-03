# Enterprise DevSecOps & Security Posture (SSDLC)

O WeddingApp abraça desde o Dia-1 o Ciclo de Desenvolvimento Seguro de Software (SSDLC). O processo de **Continuous Integration / Continuous Security** se divide nas seguintes diretrizes:

## 1. Tratamento de Dependências
- **Build-Time Gateway:** Em virtude do gancho inserido no nosso `package.json` (`prebuild: npm audit --audit-level=critical`), a Vercel negará a compilação local ou na Nuvem caso surjam *Zero-Day Exploits* Severos não-patcheados em libs terceiras (Supply Chain Security).
- **Locking:** O arquivo `package-lock.json` é tratado como artefato persistente para blindar contra atualizações silenciosas que embutam Crypto-Miners.

## 2. Bloqueios de Response (HTTP)
Injetados a nível Global de Proxy (`next.config.ts`), as seguintes travas mitigatoriamente evitam:
- `X-Frame-Options: DENY` e `CSP`: Impede incorporação do App em I-frames maliciosos (Clickjacking).
- `Referrer-Policy: strict-origin-when-cross-origin`: Oculta URLs secretas no header `Referer`.
- `X-Content-Type-Options: nosniff`: Evita Bypass explorando Tipos MIME forjados.
- `Strict-Transport-Security (HSTS)`: Força trafego contínuo HTTPS.

## 3. Gestão de Contribuição e Bug Bounty
Através dos artefatos contidos na raiz, a plataforma dita regras de cooperação ética perante a caçada por vulnerabilidades.
`SECURITY.md` -> Descreve fluxos formais de submissão.
`public/.well-known/security.txt` -> Identifica para robôs que nossa plataforma adere a normativas da RFC 9116.

## 4. Lint Automático de Validação (O Que Fazer em um PUSH)
Temos suporte ao workflow interno `.agent/workflows/test.md` para checagens interativas contínuas e pre-commit hooks via Linters que evitam Variaveis de Ambiente Hard Coded.
