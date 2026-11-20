---
name: Capturas Reanimate neste workspace
description: Requisito de ambiente para executar capturas com o browser do Reanimate.
---

Ao executar os scripts de captura do Reanimate pelo shell, exponha `libgbm.so.1` da instalação Mesa via `LD_LIBRARY_PATH`; instalar Mesa pelo helper, sozinho, não tornou a biblioteca visível ao processo Bun.

**Why:** as capturas falharam ao iniciar o browser até que o caminho da biblioteca fosse fornecido explicitamente.

**How to apply:** antes de usar `capture.ts`, `sheet.ts` ou `compare.ts`, confirme o caminho atual de `libgbm.so.1` e exporte seu diretório para o processo.
