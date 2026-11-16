# Domínio e Regras de Negócio

## Glossário de Domínio

- **Simulado / Tentativa:** Sessão cronometrada de 5 questões parametrizadas onde o estudante resolve itens em diferentes níveis de complexidade e tem seu desempenho persistido em `simulado_sessions`.
- **Trilha de Conhecimento (Track):** Conjunto estruturado de competências de Engenharia (**Eletrostática**, **Mecânica Clássica** e **Eletrônica Básica**).
- **RAG Híbrido (Vector + Few-Shot):** Combinação de busca semântica vetorial (`pgvector`, 768 dimensões) sobre documentos acadêmicos com injeção de questões-âncora da POLI/UPE.
- **Taxonomia de Bloom:** Escala cognitiva mapeada nas questões (*Fácil / Lembrar*, *Médio / Compreender–Aplicar*, *Difícil / Analisar–Projetar*) usada para calibrar o teto de proficiência do aluno por tópico.
- **Âncora Autorregressiva de Cálculo:** Estratégia de geração em que a IA deduz integralmente a resolução matemática antes de escrever o enunciado e os distratores.

## Regras de Negócio Estruturais

### 1. Geração & Fidelidade Conceitual
- **Conceptual Shift Obrigatório:** Ao utilizar uma questão-âncora no contexto RAG, a IA é instruída a alterar geometria, arranjo de circuito ou grandeza solicitada — nunca apenas substituir números.
- **Restrição por Público-Alvo:** Em níveis introdutórios/técnicos, o prompt bloqueia integrais avançadas e variáveis complexas; no nível Graduação/IES, aplica rigor analítico compatível com a ementa da POLI/UPE.
- **Lista de Exclusão Histórica (`historico_questoes`):** Enunciados recentes resolvidos pelo estudante são passados como contexto negativo para evitar repetição.
- **Protocolo `@@` + Sanitização LaTeX:** Comandos matemáticos são gerados com prefixo `@@` para segurança no parser JSON e restaurados com balanceamento determinístico de chaves e correção de letras gregas no cliente.

### 2. Segurança Acadêmica e Acesso
- **Isolamento de Gabarito:** A alternativa correta e `resolucao_analitica_latex` nunca trafegam na resposta de geração (`/questions/generate`); a verificação ocorre exclusivamente em `/questions/verify`.
- **Restrição Institucional:** Acesso liberado apenas para e-mails `@upe.br`, `@poli.br` e subdomínios oficiais (ex.: `@ecomp.poli.br`), com confirmação obrigatória de e-mail antes do acesso à API.
- **Diagnóstico Recomendado:** O motor de métricas identifica o tópico com menor percentual de acerto do estudante e o destaca como **Foco Recomendado** no painel.
