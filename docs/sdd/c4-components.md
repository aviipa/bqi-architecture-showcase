# Diagrama C4 Nível 3: Componentes do Backend API

Este diagrama detalha os componentes internos do container **Backend API (FastAPI)**.

```mermaid
flowchart LR
    SPA(["SPA Frontend<br/><sub>React 19 + KaTeX</sub>"])

    subgraph API ["Backend API (FastAPI)"]
        direction TB
        AuthCore["<b>Auth Core</b><br/><sub>JWT + email_confirmed_at</sub>"]
        RouterGen["<b>Generation Router</b><br/><sub>/generate · /verify · /report</sub>"]
        RouterMetrics["<b>Metrics Router</b><br/><sub>/dashboard · /form-attempt</sub>"]
        RouterCurr["<b>Curriculum Router</b><br/><sub>/curriculum</sub>"]
        ServiceGen["<b>Generation Service</b><br/><sub>RAG pgvector + Schema Pydantic</sub>"]
        LatexUtils["<b>LaTeX Sanitizer</b><br/><sub>Normalização @@ no servidor</sub>"]
        Models["<b>ORM Models</b><br/><sub>SQLAlchemy</sub>"]

        RouterGen -->|Valida sessão| AuthCore
        RouterMetrics -->|Valida sessão| AuthCore
        RouterGen -->|Orquestra RAG| ServiceGen
        RouterGen -->|Sanitiza resolução| LatexUtils
        RouterGen -->|Salva log & verifica gabarito| Models
        RouterMetrics -->|Agrega Bloom & sessões| Models
        ServiceGen -->|Busca referências| Models
    end

    Gemini["<b>Google Gemini API</b><br/><sub>LLM + Embeddings</sub>"]
    DB[("<b>PostgreSQL + pgvector</b><br/><sub>Supabase</sub>")]

    SPA -->|HTTPS / JSON| RouterGen
    SPA -->|HTTPS / JSON| RouterMetrics
    SPA -->|HTTPS / JSON| RouterCurr
    ServiceGen -->|google-genai| Gemini
    Models -->|SQL| DB
```
