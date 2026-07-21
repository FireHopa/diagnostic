# Diagnóstico IA 4Q's - Produção

Landing page com React + Vite + Tailwind e backend Node/Express para gerar diagnóstico com OpenAI Web Search.

Domínio preparado:

```txt
https://diagnostico.bobou.com.br
```

## Rodar local

```bash
npm install
npm run dev
```

## Rodar na VPS

Veja o arquivo:

```txt
DEPLOY_VPS.md
```

## Segurança aplicada

- OpenAI somente no backend.
- Sem rota pública para listar leads.
- Rate limit por IP.
- Limite diário por IP.
- Bloqueio de diagnóstico duplicado.
- Honeypot anti-bot.
- CORS fechado em produção.
- Validação no backend.
- Headers de segurança.
- Sanitização da resposta pública.

## Importante

Troque no `.env`:

```env
OPENAI_API_KEY=COLE_SUA_CHAVE_OPENAI_AQUI
```

Nunca coloque a chave no front-end.
