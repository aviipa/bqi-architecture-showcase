# Arquitetura Técnica — BQI (Banco de Questões Inteligente)

## Visão Geral

O **Banco de Questões Inteligente (BQI)** ([bqi.ia.br](https://bqi.ia.br)) é uma plataforma acadêmica desenvolvida na Escola Politécnica de Pernambuco (**POLI/UPE**) para geração diagnóstica, resolução comentada e validação estatística de questões parametrizadas de Engenharia.

A arquitetura foi projetada em torno de três pilares críticos de engenharia de sistemas com LLMs:
1. **Confiabilidade matemática e estrutural:** geração com Âncora Autorregressiva de Cálculo e pipeline determinístico contra alucinações JSON/LaTeX;
2. **Alinhamento pedagógico:** busca semântica vetorial (`pgvector`) combinada com *In-Context Learning* (*Few-Shot Conceptual Shift*) e Taxonomia de Bloom;
3. **Segurança e integridade acadêmica:** isolamento estrito de gabarito *server-side*, controle de acesso institucional em profundidade (*Defense-in-Depth*) e Row-Level Security (RLS).

---

## Stack Técnica

| Camada | Tecnologia | Função Arquitetural |
| :--- | :--- | :--- |
| **Backend API** | Python 3.11 + FastAPI + Pydantic v2 + SQLAlchemy | Orquestração RAG, validação de esquemas, verificação *server-side* e métricas |
| **Banco de Dados & Vetores** | PostgreSQL + `pgvector` (Supabase) | Persistência relacional, logs imutáveis e busca semântica (768 dimensões) |
| **Auth & Edge** | Supabase Auth + Postgres Hooks + Edge Functions | Autenticação JWT e restrição de domínio institucional no nível do banco |
| **Motor de IA** | Google Gemini API (`google-genai`) + Embeddings | Geração estruturada JSON e recuperação semântica de questões-âncora |
| **Frontend SPA** | React 19 + TypeScript + Vite + Tailwind CSS | Interface editorial responsiva, simulados cronometrados e dashboards |
| **Motor Matemático** | KaTeX + Sanitizador Determinístico (`typescript`) | Renderização de equações em tempo real com recuperação automática de tokens |
| **Observabilidade & Deploy** | Vercel (Analytics & Speed Insights) + Render | Hospedagem segregada Front/Back com ambiente contínuo de *Preview* |

---

## 1. Âncora Autorregressiva de Cálculo (Structured CoT)

LLMs autorregressivos falham frequentemente quando formulam o enunciado de um problema de Engenharia antes de resolver as equações — gerando alternativas incompatíveis ou enunciados sem solução.

Para eliminar essa classe de erro, o schema Pydantic (`QuestaoGerada`) impõe uma ordem estrita de geração de tokens:

1. `raciocinio_interno`: planejamento pedagógico (nível na Taxonomia de Bloom, público-alvo e desenho dos distratores típicos de erro conceitual);
2. `resolucao_analitica_latex`: dedução matemática completa passo a passo executada **antes** da redação final do problema;
3. `enunciado`: redação do problema ancorada nos valores e condições já provados na resolução;
4. `alternativas`: exatamente 5 opções (A–E), sendo uma correta e quatro distratores plausíveis baseados nos erros mapeados no passo 1.

---

## 2. Estrutura de Defesa Anti-Alucinação (`@@` Protocol + Sanitizador LaTeX)

Ao gerar JSON contendo expressões LaTeX extensas, modelos de linguagem frequentemente quebram o parser com sequências de escape inválidas (`\frac` lido como `\f` *Form Feed*, `\t` *Tab*, `\b` *Backspace*, ou aspas quebradas).

A arquitetura resolve esse conflito em duas pontas:

1. **Protocolo `@@` (Backend):** O *System Prompt* e o pós-processamento instruem a geração a substituir barras invertidas LaTeX por `@@` (ex.: `@@frac`, `@@theta`, `@@Omega`), garantindo validade estrita no `json.loads()` em Python.
2. **Brace Escaping Rule (Backend):** Chaves estruturais de agrupamento (`{` e `}`) jamais são prefixadas com `@@`, preservando limites lógicos de frações e raízes.
3. **Decodificador e Sanitizador Determinístico (Frontend & Backend):**
   - Converte sequências `@@` de volta para `\`, limpa escapes inválidos como `\.` e protege blocos `\text{...}`/`\mathrm{...}`;
   - **Auto-Fixer Grego:** expressões regulares com *lookbehind* varrem blocos matemáticos fora de `\text{}` em busca das letras gregas e macros comuns escritas sem escape (`sigma`, `Omega`, `cdot`, `oint`) e restauram a barra;
   - **Balanceador de Chaves (`balanceMathBraces`):** contador de profundidade remove chaves de fechamento órfãs e fecha blocos abertos antes de entregar ao **KaTeX**.
   - Validado por suíte de testes automatizados (`node --test`) cobrindo **60+ casos reais** coletados de reportes em produção.

---

## 3. Pipeline Híbrido de RAG (`pgvector` + Few-Shot Conceptual Shift)

O BQI cobre **3 trilhas de Engenharia** (*Eletrostática*, *Mecânica Clássica* e *Eletrônica Básica*). Em vez de depender apenas do conhecimento paramétrico do modelo:

- **Busca Semântica Vetorial:** ementas e materiais de referência na tabela `rag_documents` são indexados como embeddings de **768 dimensões** via `pgvector`.
- **Âncora Few-Shot com *Conceptual Shift*:** o backend injeta uma questão real validada pela instituição para o `topic_id` selecionado e exige mudança estrutural (geometria, circuito equivalente ou grandeza isolada), impedindo mera substituição numérica.
- **Filtro Anti-Repetição:** os últimos enunciados gerados para o estudante (`historico_questoes`) compõem uma lista de exclusão no contexto da chamada.

---

## 4. Segurança em Profundidade (*Defense-in-Depth*)

### 4.1. Isolamento de Gabarito *Server-Side* (Anti-Cheat)
- Durante a geração (`POST /api/v1/questions/generate`), o backend persiste a resolução completa e as alternativas marcadas na tabela `questoes_geradas_log`, mas retorna ao navegador **apenas o contrato `QuestaoPublica`** (enunciado e alternativas sem flag `correta` e sem resolução).
- A correção ocorre exclusivamente no servidor via `POST /api/v1/questions/verify`, que valida a alternativa escolhida contra o banco e só então devolve `resolucao_analitica_latex` e o gabarito comentado.

### 4.2. Restrição de Domínio Institucional em 3 Camadas
O acesso à plataforma é restrito a estudantes e docentes da UPE/POLI (`@upe.br`, `@poli.br` e subdomínios oficiais como `@ecomp.poli.br`):
1. **Frontend (`institutionalEmail.ts`):** feedback imediato no formulário antes da chamada de rede;
2. **Banco / Supabase Auth Hook (`before-user-created`):** função PL/pgSQL `public.hook_restrict_signup_by_institutional_email` valida o domínio diretamente no Postgres antes de criar qualquer usuário, bloqueando requisições forjadas via `curl`/API;
3. **Backend FastAPI (`core/auth.py`):** validação de JWT e verificação explícita de `email_confirmed_at` antes de autorizar geração ou consulta de métricas.

### 4.3. Banco de Dados & Telemetria (Educational Data Mining)
- **Row-Level Security (RLS)** ativado em todas as tabelas do schema `public`.
- **`questoes_geradas_log`:** persistida imediatamente antes da entrega ao aluno para evitar perda de histórico e alimentar auditoria de qualidade.
- **`simulado_sessions`:** registra desempenho, tempo total, proficiência por tópico e evolução na Taxonomia de Bloom.
