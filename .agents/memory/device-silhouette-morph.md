---
name: Morph de silhuetas
description: Regra visual para transformar o contorno animado em cada dispositivo.
---

O contorno animado principal deve assumir a silhueta externa do aparelho. Não desenhar silhuetas completas como cartões ou molduras sobrepostas ao painel.

**Why:** O usuário esclareceu que quer ver os dispositivos se transformando entre si, não silhuetas posicionadas dentro de formas independentes.

**How to apply:** Ao adicionar um dispositivo, incluir sua forma externa no morph principal. Usar camadas separadas somente para detalhes internos como tela, câmera, botões e alto-falante.

O zoom de scroll deve usar o centro estável do palco SVG, sem incluir a legenda no elemento ampliado. O fim do ScrollTrigger deve acompanhar a altura real da seção para liberar a próxima seção sem sobra.

**Why:** a legenda deslocava o zoom do aparelho, e uma distância de scroll separada da altura da seção deixava a transição desalinhada com a próxima parte.

**How to apply:** centralize o palco do aparelho, calcule o preenchimento pelo contorno morphado, esconda a legenda durante o zoom e vincule o fim da rolagem à própria altura da seção.
