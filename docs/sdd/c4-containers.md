# Diagrama C4 Nível 2: Containers

```mermaid
C4Container
    title Diagrama de Containers - Banco de Questões Inteligente (BQI)

    Person(aluno, "Estudante POLI/UPE", "Navegador Desktop ou Mobile")

    System_Boundary(bqi, "Banco de Questões Inteligente (bqi.ia.br)") {
        Container(spa, "Single Page Application", "React 19, TypeScript, Vite, Tailwind, KaTeX", "Interface editorial do aluno: Landing Page, Login Institucional, Simulados Cronometrados, Gabarito e Estatísticas")
        Container(api, "Backend API", "Python 3.11, FastAPI, Pydantic v2, SQLAlchemy", "Orquestra RAG híbrido, protege gabarito (/verify), valida JWT e agrega métricas")
        ContainerDb(db, "Database & Vector Store", "PostgreSQL + pgvector (Supabase)", "Logs imutáveis de questões, embeddings (768d), sessões de simulado e reportes")
        Container(auth, "Identity & Domain Guard", "Supabase Auth + PL/pgSQL Hook", "Emissão de JWT, confirmação de e-mail e bloqueio institucional (@upe.br / @poli.br)")
    }

    System_Ext(gemini, "Google Gemini API", "Inferência estruturada + Embeddings")
    System_Ext(resend, "Resend", "Entrega transacional de e-mails")

    Rel(aluno, spa, "Interage", "HTTPS")
    Rel(spa, auth, "Cadastro, Login e Refresh JWT", "supabase-js / HTTPS")
    Rel(spa, api, "Geração, Verificação (/verify) e Dashboards", "JSON / HTTPS + Bearer JWT")
    Rel(api, db, "Lê/escreve registros e consulta pgvector", "SQLAlchemy / PostgreSQL")
    Rel(api, gemini, "Gera questões e vetores semânticos", "google-genai")
    Rel(auth, db, "Executa hook_restrict_signup_by_institutional_email", "before-user-created")
    Rel(auth, resend, "Envia link de confirmação e redefinição", "SMTP")
```
