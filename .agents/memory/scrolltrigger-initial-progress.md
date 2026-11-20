---
name: ScrollTrigger no carregamento
description: Evita tratar a ativação inicial de uma seção fixada como interação do usuário.
---

Em animações de hero que começam no topo da página, não use apenas `ScrollTrigger.onEnter` para detectar a primeira rolagem do usuário. Verifique se o scroll passou do início do gatilho antes de interromper uma animação autônoma.

**Why:** uma seção alinhada ao topo pode entrar no estado ativo durante a atualização inicial do ScrollTrigger, antes de qualquer gesto.

**How to apply:** para iniciar uma transição apenas após a rolagem, detecte progresso/posição maior que o ponto inicial; mantenha o loop autônomo ativo enquanto a posição ainda está no início.
