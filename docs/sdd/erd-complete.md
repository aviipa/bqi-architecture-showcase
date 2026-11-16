# Diagrama de Entidade-Relacionamento (ERD)

O diagrama abaixo representa as entidades principais persistidas no PostgreSQL (Supabase), com Row-Level Security (RLS) habilitado em todas as tabelas do schema `public`.

```mermaid
erDiagram
    AUTH_USERS {
        uuid id PK
        text email "Restrito a @upe.br / @poli.br via Auth Hook"
        timestamptz email_confirmed_at "Verificado no Backend"
    }

    SIMULADO_SESSIONS {
        int id PK
        string user_id FK "Referência lógica a auth.users.id"
        string aluno_identificador
        string escola_turma
        int pontuacao_total
        float tempo_total_segundos
        string detalhes_respostas_json
        datetime data_hora
    }

    QUESTOES_GERADAS_LOG {
        string id PK "UUID v4 gerado na persistência"
        string enunciado
        string alternativas_json "Gabarito isolado no servidor"
        string resolucao_analitica_latex "Entregue apenas via /verify"
        text raciocinio_interno "Âncora Autorregressiva (CoT)"
        string bloom_level
        string topic_id
        datetime data_hora
    }

    QUESTOES_REPORTADAS {
        int id PK
        string questao_id FK
        string tipo_erro
        string descricao
        datetime data_hora
    }

    RAG_DOCUMENTS {
        string id PK
        text content
        string topic_id
        vector embedding "pgvector (768 dimensões)"
        datetime created_at
    }

    SUGESTOES_USUARIOS {
        int id PK
        string user_id FK
        text mensagem
        datetime data_hora
    }

    MOTIVOS_DELECAO {
        int id PK
        string user_id FK
        string motivo
        text detalhes
        datetime data_hora
    }

    AUTH_USERS ||--o{ SIMULADO_SESSIONS : "realiza"
    AUTH_USERS ||--o{ SUGESTOES_USUARIOS : "envia"
    AUTH_USERS ||--o{ MOTIVOS_DELECAO : "registra_ao_encerrar"
    QUESTOES_GERADAS_LOG ||--o{ QUESTOES_REPORTADAS : "recebe_auditoria"
```
