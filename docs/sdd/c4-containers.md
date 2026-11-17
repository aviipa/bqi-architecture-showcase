# Diagrama C4 Nível 2: Containers

```mermaid
flowchart LR
    Aluno(["Estudante POLI/UPE<br/><sub>Desktop & Mobile</sub>"])

    subgraph BQI ["Plataforma bqi.ia.br"]
        direction TB
        SPA["<b>SPA Frontend</b><br/><sub>React 19 · TypeScript · Vite · KaTeX</sub>"]
        Auth["<b>Identity & Domain Guard</b><br/><sub>Supabase Auth · Hook PL/pgSQL</sub>"]
        API["<b>Backend API</b><br/><sub>Python 3.11 · FastAPI · Pydantic · SQLAlchemy</sub>"]
        DB[("<b>PostgreSQL + pgvector</b><br/><sub>Logs · Embeddings 768d · RLS</sub>")]

        SPA -->|Cadastro, Login & JWT| Auth
        SPA -->|Geração, /verify & Métricas| API
        Auth -.->|hook_restrict_signup_by_institutional_email| DB
        API -->|SQLAlchemy + pgvector| DB
    end

    Gemini["<b>Google Gemini API</b><br/><sub>Inferência Estruturada + Embeddings</sub>"]
    Resend["<b>Resend SMTP</b><br/><sub>Confirmação e Recuperação</sub>"]

    Aluno -->|HTTPS| SPA
    API -->|google-genai| Gemini
    Auth -->|SMTP / TLS| Resend
```
