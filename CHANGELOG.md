# Changelog — Banco de Questões Inteligente (BQI)

Registro evolutivo das entregas arquiteturais e funcionais da plataforma ([bqi.ia.br](https://bqi.ia.br)).

---

## [1.0.0] — 2026-11 (Produção POLI/UPE)

### Segurança em Profundidade no Autenticador & Landing Page
- **Restrição Institucional no Banco (`before-user-created`):** adicionada função PL/pgSQL `hook_restrict_signup_by_institutional_email` no Supabase Auth bloqueando cadastros fora de `@upe.br`, `@poli.br` e subdomínios oficiais mesmo em chamadas diretas à API.
- **Confirmação Obrigatória de E-mail:** verificação de `email_confirmed_at` na camada FastAPI (`HTTP 403`) e fluxo completo de reenvio/tratamento de tokens expirados no cliente via SMTP Resend (`noreply@bqi.ia.br`).
- **Landing Page Editorial como Porta de Entrada (`/`):** página pública de apresentação técnica, fluxo de estudo em 4 etapas, trilhas de Engenharia e parceria institucional com a POLI/UPE.
- **Suíte de Testes Frontend (`node --test`):** cobertura automatizada de validação de domínios institucionais e **60+ casos reais** de regressão de sanitização LaTeX/KaTeX coletados em produção.

---

## [0.8.0] — 2026-10 (Escala de Trilhas, RAG Vetorial & Gabarito Server-Side)

### Isolamento de Gabarito e Verificação Assíncrona
- Introduzidos os schemas `QuestaoPublica` e `AlternativaPublica` no endpoint `/api/v1/questions/generate`, eliminando o envio antecipado da alternativa correta e da resolução na resposta de geração.
- Criado endpoint `POST /api/v1/questions/verify` para correção autoritativa no servidor e liberação sob demanda da resolução passo a passo.

### Expansão Curricular & RAG Vetorial (`pgvector`)
- Expansão para **3 trilhas completas**: *Eletrostática (FELM)*, *Mecânica Clássica (FMBC)* e *Eletrônica Básica (ELET)*.
- Adicionada tabela `rag_documents` com suporte a `pgvector` (embeddings de **768 dimensões**) para busca semântica de materiais acadêmicos e referências curriculares.
- Refinamento dos dashboards de evolução (`Desempenho.tsx`) com histórico paginado, metas semanais e recomendação automática de foco por menor taxa de acerto.

---

## [0.5.0] — 2026-08 (Armadura KaTeX & Telemetria)

### Armadura KaTeX (Frontend e Backend)
- Implementado protocolo `@@` no *System Prompt* e no pós-processamento para erradicar falhas de `json.loads` com sequências `\f`, `\t`, `\b` e `\.`.
- Criado sanitizador determinístico (`latexSanitizer.ts`) com `balanceMathBraces` e *Auto-Fixer* de alfabeto grego via Regex *lookbehind*.

### Injeção de Ementa RAG (*Few-Shot*) e Telemetria
- Implementado mecanismo de *In-Context Learning* com regra explícita de **Conceptual Shift** a partir de questões-âncora da instituição.
- Persistência imediata em `questoes_geradas_log` e rastreamento de sessões completas em `simulado_sessions`.

---

## [0.1.0] — 2026-07 (Fundação)

- Estruturação inicial do backend FastAPI + SQLAlchemy + Pydantic v2 + PostgreSQL (Supabase).
- Integração inicial com Google Gemini API aplicando **Âncora Autorregressiva de Cálculo** (`raciocinio_interno` + `resolucao_analitica_latex` antes do enunciado).
- Exposição do endpoint inicial `POST /api/v1/questions/generate` e interface base em React + TypeScript + Tailwind CSS.
