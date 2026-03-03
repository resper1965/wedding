# PLAN: Repositorio Hygienic Cleanup & Enterprise Documentation

**Orquestração de Agentes Envolvidos:**
- `explorer-agent` (Mapeamento do Repositório)
- `devops-engineer` (Limpeza de Dependências e Build)
- `documentation-writer` (Produção dos Documentos)
- `security-auditor` & `test-engineer` (Validação Final)

---

## Phase 1: Codebase Hygiene & Cleanup
*Objetivo: Escanear todas as sobras do ciclo MVP e reduzir o peso do repo.*

1. **Varredura de Arquivos Órfãos:**
   - Buscar e excluir componentes que não estão sendo instanciados ou arquivos `.bak`, `.old`.
   - Limpar rastros de imagens ou SVGs inutilizados (pasta `/public`).
2. **Higiene de Dependências:**
   - Executar análise estática para parear o `package.json` com o uso real no código, expurgando pacotes mortos.
3. **Limpeza de Terminal/Console:**
   - Remover resíduos de `console.log()` focados puramente em debug local.
   - Apagar lixo residual de configurações velhas.

## Phase 2: Enterprise-Grade Documentation
*Objetivo: Subir a régua da documentação do sistema a um padrão de adoção Open-Source/Enterprise.*

1. **`README.md` (Vitrine Global):**
   - Introduzir Shields (Badges de Build, Licença, etc).
   - Diagrama alto-nível da Arquitetura e Tech Stack (Next.js, Supabase, Cloud Run).
   - Quickstart detalhado p/ Desenvolvedores (Variáveis de Ambiente, Node.js version).
2. **`docs/ARCHITECTURE.md`:**
   - Detalhamento de como o Multi-Tenancy opera dentro do NextJS App Router;
   - Separação de competências entre o Vercel Frontend e a API de WhatsApp (Python/Go - Cloud Run).
3. **`docs/API_REFERENCE.md`:**
   - Documentar os endpoints REST (/api/rsvp, /api/users, etc) para integração de sistemas terceiros ou apps mobile futuros.
4. **`docs/DEVSECOPS.md`:**
   - Atestar sobre as diretrizes de CI/CD que foram integradas recentemente, explicitando o Fluxo de Pentest, CSP, Headers, e Hooks de Segurança (Husky).

## Phase 3: Verification & Auditing
1. Validar integridade após o apagão rodando `npm run build`;
2. Executar `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .`;
3. Executar `python .agent/skills/lint-and-validate/scripts/lint_runner.py .`;
4. Emitir `Orchestration Report` completo na tela.
