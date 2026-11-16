# Visão Arquitetural

## 1. Topologia do Sistema

O **Banco de Questões Inteligente (BQI)** opera em uma arquitetura *Client-Server* desacoplada (SPA + API REST) integrada a serviços gerenciados de banco vetorial, autenticação e inferência generativa:

- **Frontend (React 19 + TypeScript + Vite):** responsável pela experiência diagnóstica do estudante, renderização matemática segura com KaTeX (sanitizador determinístico de LaTeX), simulados cronometrados e visualização de progresso.
- **Backend API (Python 3.11 + FastAPI + SQLAlchemy):** orquestra o pipeline híbrido de RAG (`pgvector` + *Few-Shot*), impõe contratos Pydantic v2 com Âncora Autorregressiva, executa verificação *server-side* de gabarito e consolida métricas de desempenho.
- **Persistência & Identidade (Supabase):** provê PostgreSQL gerenciado com extensão `pgvector` (embeddings de 768 dimensões), Row-Level Security (RLS), autenticação JWT com confirmação de e-mail (SMTP via Resend) e Postgres Auth Hook para restrição institucional de domínio.

## 2. Padrões Arquiteturais e de Design

- **Backend (Python / FastAPI):**
  - **Camadas Desacopladas (`routers/` → `services/` → `db/`):** endpoints delegam regras de geração, validação e métricas a serviços especializados e modelos ORM SQLAlchemy.
  - **Dependency Injection:** sessões de banco (`Depends(get_db)`) e validação estrita de usuário autenticado e e-mail confirmado (`Depends(get_current_user)`).
  - **Separação Público vs. Interno (DTOs):** retorno sanitizado (`QuestaoPublica`) na geração e liberação autoritativa do gabarito apenas após submissão em `/questions/verify`.

- **Frontend (React / TypeScript):**
  - **Design System Editorial:** estilização via Tailwind CSS com tokens consistentes, tipografia acadêmica (IBM Plex Sans/Serif/Mono) e componentes modulares.
  - **Contexto de Autenticação (`AuthContext`):** gerenciamento de sessão JWT via `@supabase/supabase-js` com validação antecipada de domínio institucional (`institutionalEmail.ts`).
  - **Blindagem Determinística de Renderização (`latexSanitizer.ts`):** normalização de protocolo `@@`, balanceamento de chaves `{}` e *Auto-Fixer* de símbolos gregos cobertos por suíte automatizada (`node --test` com 60+ casos reais de produção).

## 3. Mapa de Integrações

- **Supabase (PostgreSQL + `pgvector` + Auth):** armazenamento de logs (`questoes_geradas_log`), sessões (`simulado_sessions`), documentos vetoriais (`rag_documents`), reportes (`questoes_reportadas`) e validação institucional via PL/pgSQL Auth Hook (`before-user-created`).
- **Google Gemini API (`google-genai`):** geração estruturada via `application/json` + `response_schema` e geração de embeddings de 768 dimensões para recuperação semântica.
- **Resend (SMTP):** entrega transacional de e-mails de confirmação de conta e recuperação de senha sob o domínio verificado `bqi.ia.br`.
- **Vercel (Hosting, Analytics & Speed Insights):** entrega estática do SPA, preview contínuo por branch e telemetria de Web Vitals.
