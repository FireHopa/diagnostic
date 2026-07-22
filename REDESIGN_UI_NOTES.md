# Redesign UI — AI Native Interface

## Escopo

Este pacote aplica somente a renovação de interface/UX solicitada. A lógica central de diagnóstico, armazenamento, API e backend foi preservada.

## Direção visual aplicada

- Interface inspirada na linguagem de produtos de IA atuais, combinando limpeza editorial, leitura contínua e superfícies discretas.
- Background principal branco.
- Superfícies secundárias em `#F8F9FA`.
- Azul funcional `#1A73E8` para ações, links e estados selecionados.
- Tipografia Inter com fallback para Segoe UI, Roboto, Helvetica e Arial.
- Pesos predominantes entre 400 e 700.
- Largura de leitura controlada entre 720px e 920px conforme o conteúdo.
- Header sticky de produto com ação “Nova análise”.
- Menos cardização, menos sombras e menor raio de borda.
- Loading convertido em atividade progressiva de IA usando os mesmos estados e timers já existentes.
- Resultados reorganizados com leitura editorial e separações por linhas/espaçamento.
- Fontes de reputação reorganizadas em formato de referências.
- 7 dimensões mantidas em `<details>`, preservando o comportamento de abrir/fechar.
- CTA final integrado ao fluxo de leitura, sem aparência de landing page separada.

## Arquivos de lógica preservados sem alteração

- `src/utils/diagnostico.js`
- `src/utils/reputacao.js`
- `src/utils/storage.js`
- `server/index.js`

## Contratos funcionais preservados

- `recomendacao_ia`
- `reputacao`
- `tipoDiagnostico`
- IDs `diagnosticos`, `diagnostico` e `resultado`
- `resultRef`
- Honeypot `website`
- Campos e nomes utilizados pelos formulários
- Validações existentes
- Callbacks de submit
- Chamadas às APIs
- Fallback do diagnóstico de recomendação
- Timer e mensagens de loading
- CTA existente

## Arquivos visuais alterados

- `tailwind.config.js`
- `src/index.css`
- `src/App.jsx` somente na camada de renderização
- `src/components/Header.jsx` novo componente visual
- `src/components/Hero.jsx`
- `src/components/DiagnosticSelector.jsx`
- `src/components/DiagnosticForm.jsx`
- `src/components/ReputationForm.jsx`
- `src/components/InfoSection.jsx`
- `src/components/DiagnosticResult.jsx`
- `src/components/ReputationResult.jsx`
- `src/components/Footer.jsx`

## Validação executada

Comando:

```bash
npm ci
npm run build
```

Resultado: build de produção concluído com sucesso no Vite.

O projeto original não contém diretório `tests`, portanto não havia suíte automatizada adicional para executar.
