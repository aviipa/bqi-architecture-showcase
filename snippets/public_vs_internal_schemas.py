"""
Demonstração dos contratos Pydantic que implementam:
1. Âncora Autorregressiva de Cálculo (QuestaoGerada): força a IA a resolver a questão antes de redigi-la.
2. Isolamento de Gabarito Server-Side (QuestaoPublica): omite a resposta correta e a resolução do payload entregue ao navegador.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Literal


class GeracaoRequest(BaseModel):
    discipline_id: str = Field(..., max_length=50, pattern=r"^[a-zA-Z0-9_-]+$")
    discipline_name: str = Field(..., max_length=150)
    syllabus: str = Field(..., max_length=2000)
    competencies: List[str] = Field(..., max_length=20)
    topic: str = Field(..., max_length=200)
    topic_id: str = Field(default="", max_length=100)
    bloom_level: Literal["Fácil", "Médio", "Difícil"]
    target_audience: Literal["Ensino Técnico/Médio", "Graduação/IES"]
    historico_questoes: List[str] = Field(default=[], max_length=15)
    use_academic_reference: bool = Field(default=True)


# --- Modelo Interno (Persistido no Banco & Validado na Gemini API) ---

class AlternativaInterna(BaseModel):
    letra: str = Field(..., description="Letra da alternativa: A, B, C, D ou E")
    texto: str = Field(..., description="Texto da alternativa em português brasileiro")
    correta: bool = Field(..., description="True apenas para a alternativa correta")


class QuestaoGerada(BaseModel):
    id: Optional[str] = None
    raciocinio_interno: str = Field(
        ...,
        description="Planejamento pedagógico (Bloom + erros típicos para distratores) gerado antes do cálculo."
    )
    resolucao_analitica_latex: str = Field(
        ...,
        description="Âncora Autorregressiva: resolução matemática completa gerada ANTES do enunciado."
    )
    enunciado: str = Field(
        ...,
        description="Enunciado da questão formulado de forma consistente com a resolução já provada."
    )
    tipo: str = Field(default="Múltipla Escolha")
    alternativas: List[AlternativaInterna]


# --- Contratos Públicos (Entregues ao Cliente SPA — Anti-Cheat) ---

class AlternativaPublica(BaseModel):
    letra: str
    texto: str
    # Campo `correta` propositalmente omitido para impedir inspeção via DevTools/Network


class QuestaoPublica(BaseModel):
    id: str
    enunciado: str
    tipo: str = "Múltipla Escolha"
    alternativas: List[AlternativaPublica]
    bloom_level: Optional[str] = None
    topic_id: Optional[str] = None
    topic_label: Optional[str] = None


class AnswerSubmitRequest(BaseModel):
    questao_id: str = Field(..., max_length=64)
    alternativa_escolhida: str = Field(..., max_length=5)


class AnswerVerificationResponse(BaseModel):
    is_correta: bool
    alternativa_correta: str
    resolucao_analitica_latex: str
    raciocinio_interno: str
