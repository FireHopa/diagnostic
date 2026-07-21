# Plataforma de Diagnósticos IA - Produção

Aplicação React + Vite + Tailwind com backend Node/Express para executar dois diagnósticos empresariais:

1. **Recomendação por Inteligência Artificial**: preserva o diagnóstico original baseado nos 4Q's e análise de concorrentes.
2. **Reputação e Autoridade Digital**: analisa a própria empresa em 7 dimensões, com score, evidências, fontes e roadmap.

Domínio preparado:

```txt
https://diagnostico.bobou.com.br
```

## Rodar local

```bash
npm install
npm run dev
```

## Validar

```bash
npm test
npm run build
```

## Rodar na VPS

Veja o arquivo:

```txt
DEPLOY_VPS.md
```

## APIs

```txt
POST /api/diagnostico-ia
POST /api/diagnostico-reputacao
GET  /api/health
```

## Segurança aplicada

- OpenAI somente no backend.
- Sem rota pública para listar leads.
- Rate limit por IP.
- Limite diário por IP.
- Bloqueio de diagnóstico duplicado considerando `tipoDiagnostico`.
- Compatibilidade com bloqueios legados do diagnóstico original.
- Honeypot anti-bot preservado.
- Campo legítimo de site separado como `siteEmpresa`.
- CORS fechado em produção.
- Validação no backend.
- Headers de segurança.
- O diagnóstico de reputação não usa fallback fictício.
- Fontes públicas são exibidas apenas no fluxo de reputação, sem expor prompts, chaves ou logs internos.

## Importante

Troque no `.env`:

```env
OPENAI_API_KEY=COLE_SUA_CHAVE_OPENAI_AQUI
```

Nunca coloque a chave no front-end.
