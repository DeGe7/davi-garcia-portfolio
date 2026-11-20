---
name: Retorno do texto ao hero
description: Regra para reiniciar o ciclo de chamadas ao voltar à primeira seção.
---

Sempre que a pessoa voltar ao hero, o ciclo de textos recomeça no primeiro texto. O ciclo deve ficar pausado enquanto a chamada estiver oculta durante a rolagem.

**Why:** o usuário pediu explicitamente que o retorno ao hero sempre comece pelo início, em vez de retomar uma chamada aleatória do ciclo.

**How to apply:** use a direção e o progresso da rolagem para reiniciar o estado na volta; só retome o temporizador quando o texto estiver visível e a rolagem tiver parado.
