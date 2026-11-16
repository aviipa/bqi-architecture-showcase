# Máquinas de Estado

## 1. Fluxo do Simulado Diagnóstico (Frontend + Verificação Server-Side)

O ciclo de uma sessão de simulado garante integridade pedagógica: o cliente recebe apenas as questões públicas (`QuestaoPublica`) e só desbloqueia a resolução comentada após a verificação no servidor (`POST /api/v1/questions/verify`).

```mermaid
stateDiagram-v2
    [*] --> ConfiguracaoTrilha : Seleciona Trilha e Tópicos
    ConfiguracaoTrilha --> GerandoQuestao : Iniciar Simulado (POST /questions/generate)
    GerandoQuestao --> QuestaoAtiva : Recebe QuestaoPublica (sem gabarito)
    QuestaoAtiva --> VerificandoResposta : Submete Alternativa (POST /questions/verify)
    VerificandoResposta --> QuestaoAtiva : Próxima Questão (i < 5)
    VerificandoResposta --> SimuladoConcluido : Última Questão Concluída (i == 5)
    QuestaoAtiva --> ReporteErro : Aluno denuncia erro (POST /questions/report)
    ReporteErro --> QuestaoAtiva : Continua ou avança questão
    SimuladoConcluido --> RevisaoGabarito : Grava SimuladoSession & abre Gabarito
    RevisaoGabarito --> [*]
```

---

## 2. Fluxo de Autenticação Institucional (Defense-in-Depth)

```mermaid
stateDiagram-v2
    [*] --> FormularioLogin : E-mail institucional
    FormularioLogin --> BloqueadoClientSide : Domínio != upe.br / poli.br
    FormularioLogin --> ValidacaoAuthHook : Envia signUp ao Supabase Auth
    ValidacaoAuthHook --> BloqueadoPostgres : Hook PL/pgSQL rejeita (HTTP 403)
    ValidacaoAuthHook --> AguardandoConfirmacao : Usuário criado sem confirmação
    AguardandoConfirmacao --> TokenExpirado : Link expirou / já utilizado
    TokenExpirado --> AguardandoConfirmacao : Reenvia link via SMTP Resend
    AguardandoConfirmacao --> SessaoAtiva : E-mail confirmado (email_confirmed_at != null)
    SessaoAtiva --> APIAutorizada : FastAPI valida JWT + email_confirmed_at
```
