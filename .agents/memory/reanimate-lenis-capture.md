---
name: Captura de scroll com Lenis
description: Como gravar transições guiadas por scroll em páginas que usam Lenis com Reanimate.
---

Ao capturar uma animação ligada ao scroll, use poucos passos de rolagem, intervalo longo o bastante para o Lenis assentar e uma pausa antes da gravação. Confira o `scrollY` registrado nos tracks antes de comparar as curvas.

**Why:** eventos rápidos ou gravados antes de a página e as fontes assentarem podem produzir frames transitórios, mesmo quando a animação responde corretamente em uso normal.

**How to apply:** comece com 4–5 passos, rolagem de vários segundos e um pre-wait generoso; ajuste só depois de verificar o track e a tira de frames.
