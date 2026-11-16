# Dependências e Tecnologias

Principais bibliotecas e serviços utilizados em produção no **BQI**.

## Backend (`Python 3.11`)

| Pacote | Finalidade |
| :--- | :--- |
| `fastapi` + `uvicorn` + `gunicorn` | API REST assíncrona/WSGI de alta performance e documentação OpenAPI |
| `pydantic >= 2.0` + `pydantic-settings` | Validação estrita de contratos I/O, Structured Outputs e configuração de ambiente |
| `google-genai` | SDK oficial para geração com Gemini e cálculo de embeddings vetoriais |
| `sqlalchemy` + `psycopg[binary]` + `pgvector` | ORM relacional, conexão PostgreSQL (Supabase) e consultas de similaridade vetorial |
| `supabase` | Verificação JWT no backend e integração com o Auth |

## Frontend (`React 19 + TypeScript + Vite 8`)

| Pacote | Finalidade |
| :--- | :--- |
| `react` + `react-dom` (`^19`) | Renderização declarativa da SPA |
| `react-router-dom` (`^7`) | Roteamento client-side (`/`, `/login`, `/dashboard`, `/simulado/novo`, `/desempenho`, `/privacidade`) |
| `@supabase/supabase-js` | Gerenciamento de sessão Auth, confirmação de e-mail e invocação de Edge Functions |
| `tailwindcss` | Design system editorial responsivo |
| `katex` | Renderização matemática de alta fidelidade alimentada pelo sanitizador determinístico |
| `lucide-react` | Iconografia leve da interface |
| `oxlint` + `tsc -b` + `vite build` | Lint estrito, checagem de tipos e empacotamento de produção |
| `node --test` | Suíte automatizada de testes unitários e de regressão (LaTeX + Domínio Institucional) |
