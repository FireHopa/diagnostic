# Deploy na VPS - Plataforma de Diagnósticos IA

Domínio configurado para esta entrega:

```txt
diagnostico.bobou.com.br
```

Caminho usado na VPS:

```txt
/home/deploy/landing-diagnostico-ia-4qs-limiter
```

## 1. Entrar na pasta

```bash
cd /home/deploy/landing-diagnostico-ia-4qs-limiter
```

## 2. Ajustar o .env

```bash
nano .env
```

Troque apenas a chave:

```env
OPENAI_API_KEY=COLE_SUA_CHAVE_OPENAI_AQUI
```

O restante já está preparado para produção em:

```env
FRONTEND_URL=https://diagnostico.bobou.com.br
PORT=3010
APP_ENV=production
RATE_LIMIT_MAX_REQUESTS=5
RATE_LIMIT_DAILY_MAX_REQUESTS=20
```

## 3. Instalar e gerar build

```bash
rm -rf node_modules package-lock.json
npm config set registry https://registry.npmjs.org/
npm install --no-audit --no-fund
npm run build
```

## 4. Subir com PM2

```bash
sudo npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 status
```

Se já existir processo antigo:

```bash
pm2 restart diagnostico-ia
```

## 5. Configurar Nginx

```bash
sudo cp nginx-diagnostico-ia.conf /etc/nginx/sites-available/diagnostico.bobou.com.br
sudo ln -sf /etc/nginx/sites-available/diagnostico.bobou.com.br /etc/nginx/sites-enabled/diagnostico.bobou.com.br
sudo nginx -t
sudo systemctl reload nginx
```

## 6. DNS

No painel do domínio, crie:

```txt
Tipo: A
Nome: diagnostico
Valor: IP público da VPS
```

Teste:

```bash
dig +short diagnostico.bobou.com.br
```

## 7. SSL

Quando o DNS já apontar para a VPS:

```bash
sudo certbot --nginx -d diagnostico.bobou.com.br
```

## 8. Testes rápidos

Backend:

```bash
curl http://127.0.0.1:3010/api/health
```

API via domínio, depois do SSL:

```bash
curl -i https://diagnostico.bobou.com.br/api/health
```

Logs:

```bash
pm2 logs diagnostico-ia
```

## Segurança já aplicada

- Chave OpenAI somente no backend.
- Rota pública de leads removida.
- O diagnóstico original continua sem expor informações técnicas internas.
- O diagnóstico de reputação mostra apenas fontes públicas efetivamente usadas, sem expor prompts, chaves ou logs privados.
- Bloqueio de duplicidade considera o tipo de diagnóstico e preserva compatibilidade com registros antigos.
- Bloqueio por navegador com client id.
- Rate limit por IP a cada 15 minutos.
- Limite diário por IP.
- Honeypot anti-bot no formulário.
- CORS fechado para o domínio oficial em produção.
- Validação e limite de tamanho no backend.
- Headers de segurança no Express.
- Nginx com bloqueio de arquivos ocultos.
