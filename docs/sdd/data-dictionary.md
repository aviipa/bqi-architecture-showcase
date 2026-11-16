# Dicionário de Dados & Contratos

Este documento mapeia as entidades principais persistidas no PostgreSQL (Supabase) e os contratos Pydantic expostos pela API FastAPI.

---

## 1. Persistência (SQLAlchemy / PostgreSQL + `pgvector`)

### 1.1. `questoes_geradas_log`
Registra de forma imutável toda questão gerada pela IA antes mesmo da entrega ao cliente.
- `id` (`String` UUID v4, PK): identificador único da questão.
- `enunciado` (`String`): enunciado parametrizado em português brasileiro.
- `alternativas_json` (`String` JSON): array com 5 alternativas (A–E) e flag booleana interna `correta`.
- `resolucao_analitica_latex` (`String`): passo a passo analítico retido no servidor até a chamada de `/verify`.
- `raciocinio_interno` (`Text`, nullable): rascunho de planejamento pedagógico e calibração dos distratores.
- `bloom_level` (`String`, nullable): nível da Taxonomia de Bloom (`Fácil`, `Médio`, `Difícil`).
- `topic_id` (`String`, nullable): identificador do tópico curricular.
- `data_hora` (`DateTime`): carimbo temporal da geração.

### 1.2. `simulado_sessions`
Persiste as tentativas concluídas e o histórico de desempenho por estudante.
- `id` (`Integer`, PK): chave primária incremental.
- `user_id` (`String`, index): referência lógica ao usuário no Supabase Auth (`auth.users.id`).
- `aluno_identificador` (`String`, index): identificação do estudante.
- `escola_turma` (`String`, index): vínculo de trilha/instituição.
- `pontuacao_total` (`Integer`): número de acertos no simulado.
- `tempo_total_segundos` (`Float`): tempo cronometrado total de resolução.
- `detalhes_respostas_json` (`String` JSON): registro das questões respondidas, escolhas e acertos por tópico.
- `data_hora` (`DateTime`): timestamp da sessão.

### 1.3. `rag_documents`
Base vetorial de documentos acadêmicos e trechos de ementa para busca semântica.
- `id` (`String`, PK): identificador do documento.
- `content` (`Text`): conteúdo textual de referência.
- `topic_id` (`String`, index): tópico associado ao trecho.
- `embedding` (`vector(768)` via `pgvector`): vetor semântico gerado via Gemini Embeddings.
- `created_at` (`DateTime`): data de indexação.

### 1.4. `questoes_reportadas`
Auditoria de qualidade enviada pelos estudantes quando detectam inconsistências matemáticas ou de enunciado.
- `id` (`Integer`, PK): chave primária.
- `questao_id` (`String`, index): referência à questão em `questoes_geradas_log`.
- `tipo_erro` (`String`): categoria (ex.: `"Equação quebrada"`, `"Sem resposta correta"`).
- `descricao` (`String`): detalhamento opcional enviado pelo aluno.
- `data_hora` (`DateTime`): timestamp do reporte.

---

## 2. Contratos Pydantic (API REST `/api/v1`)

### 2.1. `GeracaoRequest` (`POST /questions/generate`)
- `discipline_id`, `discipline_name`, `syllabus`, `competencies`
- `topic`, `topic_id`
- `bloom_level`: `"Fácil" | "Médio" | "Difícil"`
- `target_audience`: `"Ensino Técnico/Médio" | "Graduação/IES"`
- `historico_questoes`: `List[str]` (máx. 15 itens para anti-repetição)
- `use_academic_reference`: `bool` (ativa o pipeline RAG)

### 2.2. `QuestaoPublica` (Resposta segura de `/questions/generate`)
- `id`, `enunciado`, `tipo`, `bloom_level`, `topic_id`, `topic_label`
- `alternativas`: `List[AlternativaPublica]` (`letra` e `texto` — **sem `correta` e sem resolução**)

### 2.3. `AnswerVerificationResponse` (`POST /questions/verify`)
- `is_correta`: `bool`
- `alternativa_correta`: `str`
- `resolucao_analitica_latex`: `str` (sanitizada no servidor)
- `raciocinio_interno`: `str`
