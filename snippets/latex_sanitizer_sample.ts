/**
 * Amostra do motor determinístico de recuperação LaTeX/KaTeX usado no BQI.
 *
 * Motivação: LLMs frequentemente quebram JSON ao emitir `\frac`, `\theta` ou `\beta`
 * (interpretados como caracteres de controle `\f`, `\t`, `\b`) ou esquecem escapes
 * e chaves de fechamento em expressões longas.
 *
 * Estratégia em produção:
 * 1. Backend gera comandos matemáticos prefixados com `@@` (Protocolo `@@`).
 * 2. Frontend decodifica `@@` -> `\`, restaura letras gregas sem escape fora de
 *    blocos `\text{...}` (Auto-Fixer Grego) e balanceia chaves `{}` via contador
 *    de profundidade antes de passar ao KaTeX.
 */

const GREEK_LETTERS = [
  'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'varepsilon', 'zeta', 'eta',
  'theta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'pi', 'rho', 'sigma',
  'tau', 'upsilon', 'phi', 'varphi', 'chi', 'psi', 'omega',
  'Gamma', 'Delta', 'Theta', 'Lambda', 'Xi', 'Pi', 'Sigma', 'Upsilon', 'Phi', 'Psi', 'Omega',
] as const;

/**
 * Balanceia chaves `{}` dentro de um bloco matemático utilizando pilha de profundidade.
 * Remove `}` órfãs no nível 0 e fecha blocos que ficaram abertos antes de pontuação final.
 */
export function balanceMathBraces(mathContent: string): string {
  if (!mathContent) return '';

  let s = mathContent.replace(/\\+\s*$/, '');
  let trailingPunct = '';
  const trailingMatch = s.match(/([.,;]+)\s*$/);

  if (trailingMatch) {
    let tempDepth = 0;
    for (let i = 0; i < s.length; i++) {
      if (s[i] === '\\') {
        i++;
        continue;
      }
      if (s[i] === '{') tempDepth++;
      else if (s[i] === '}' && tempDepth > 0) tempDepth--;
    }
    if (tempDepth > 0) {
      trailingPunct = trailingMatch[1];
      s = s.slice(0, s.length - trailingMatch[0].length);
    }
  }

  let depth = 0;
  let out = '';

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '\\') {
      if (i + 1 < s.length) {
        out += ch + s[i + 1];
        i++;
      }
      continue;
    }
    if (ch === '{') {
      depth++;
      out += ch;
    } else if (ch === '}') {
      if (depth > 0) {
        depth--;
        out += ch;
      }
    } else {
      out += ch;
    }
  }

  while (depth > 0) {
    out += '}';
    depth--;
  }

  return out + trailingPunct;
}

/**
 * Decodifica o protocolo `@@` e aplica o Auto-Fixer Grego protegendo blocos `\text{...}` e `\mathrm{...}`
 * para não corromper palavras comuns em português.
 */
export function sanitizeMathBlock(rawMath: string): string {
  // 1. Converte tokens seguros de JSON (@@frac -> \frac) e limpa escapes inválidos (\.)
  let m = rawMath
    .replace(/@@(?=[a-zA-Z()[\]{}|])/g, '\\')
    .replace(/\\{2,}(?=[a-zA-Z])/g, '\\')
    .replace(/\\\./g, '.');

  // 2. Isola blocos de texto literal para o Auto-Fixer não alterar palavras dentro de \text{}
  const textBlocks: string[] = [];
  m = m.replace(/\\(?:text|mathrm)\s*\{[^{}]*\}/g, (match) => {
    textBlocks.push(match);
    return `__TEXT_BLOCK_${textBlocks.length - 1}__`;
  });

  // 3. Auto-Fixer Grego e operadores comuns que a IA ocasionalmente omite a barra
  for (const letter of GREEK_LETTERS) {
    const regex = new RegExp(`(?<!\\\\)\\b${letter}\\b`, 'g');
    m = m.replace(regex, `\\${letter}`);
  }
  m = m
    .replace(/(?<!\\)\boint\b/g, '\\oint')
    .replace(/(?<!\\)\btimes\b/g, '\\times')
    .replace(/(?<!\\)\bcdot\b/g, '\\cdot');

  // 4. Restaura os blocos de texto literal e garante balanceamento final de chaves
  m = m.replace(/__TEXT_BLOCK_(\d+)__/g, (_, idx) => textBlocks[Number(idx)]);
  return balanceMathBraces(m);
}
