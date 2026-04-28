# Plano: Corrigir reordenação dos cards do dashboard fiscal

## Diagnóstico — Por que o PR #48 não funcionou

### O que o PR #48 fez corretamente
- Moveu o card **"Pts Enviados"** para a **1ª posição** no HTML ✅
- Adicionou a classe `.metric-card-wide` ao card "Apuração Final" ✅
- Adicionou media queries para mobile (≤ 768 px e ≤ 480 px) ✅

### O problema: CSS contraditório com a própria descrição do PR

A descrição do PR #48 dizia:
> "Remove forced 4-column desktop grid override" e "Remove desktop `grid-column: 2 / span 2`"

Mas o diff fez o **oposto** — adicionou exatamente essas regras:

```css
/* ADICIONADO pelo PR #48 — causa o problema */
#view-fiscal .metrics-grid {
  grid-template-columns: repeat(4, 1fr);  /* grid de 4 colunas */
}
.metric-card-wide {
  grid-column: 2 / span 2;  /* ← ESTE É O CULPADO */
}
```

### Como isso quebra o layout no desktop

Com 4 colunas e 5 cards, o CSS Grid preenche assim:

```
Linha 1: | Pts Enviados | PP | PN | PV |
Linha 2: |   (vazio)    | ←   Apuração Final   → |   (vazio)   |
```

O `grid-column: 2 / span 2` força "Apuração Final" a começar na **coluna 2** e ocupar 2 colunas (cols 2 e 3), deixando a **coluna 1 e a coluna 4 da linha 2 completamente vazias**. O resultado é um layout torto, com o card flutuando no meio da linha.

### Por que o mobile funciona parcialmente

No mobile (≤ 768 px, 2 colunas), o `span 2` cobre a linha inteira — não há gaps. Mas o posicionamento do primeiro card (Pts Enviados) também pode parecer inconsistente dependendo do tamanho de tela, pois a regra desktop vaza até `>768px`.

---

## Solução — O que precisa ser mudado

Arquivo: **`dashboard.html`** — bloco `<style>` no `<head>` (linhas 15–31).

### Mudança única necessária

Substituir:
```css
.metric-card-wide {
  grid-column: 2 / span 2;
}
```

Por:
```css
.metric-card-wide {
  grid-column: span 4;
}
```

### Resultado esperado após a correção

**Desktop (> 768 px) — grid de 4 colunas:**
```
Linha 1: | Pts Enviados | PP | PN | PV |
Linha 2: |        Apuração Final (largura total)        |
```

**Mobile (≤ 768 px) — grid de 2 colunas:**
```
Linha 1: | Pts Enviados | PP |
Linha 2: | PN           | PV |
Linha 3: | Apuração Final (span 2 = largura total) |
```

**Mobile pequeno (≤ 480 px):** mesmo que ≤ 768 px, já coberto pelas media queries existentes.

---

## Checklist de implementação

- [ ] Em `dashboard.html`, no `<style>` do `<head>`, alterar `.metric-card-wide { grid-column: 2 / span 2; }` para `grid-column: span 4;`
- [ ] Verificar visualmente no browser (desktop e ≤ 768 px)
- [ ] Confirmar que "Pts Enviados" aparece como 1º card nos dois breakpoints
- [ ] Confirmar que "Apuração Final" ocupa a linha inteira abaixo dos 4 cards

> **Nota:** A ordem dos cards no HTML já está correta (Pts Enviados é o 1º `<div class="metric-card">` dentro de `.metrics-grid`). Nenhuma mudança de HTML é necessária.
