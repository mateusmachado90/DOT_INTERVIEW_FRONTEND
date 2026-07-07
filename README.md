# DOT_INTERVIEW_FRONTEND

Frontend da solucao DOT Interview, construido com React, Vite e TypeScript.

## Escopo da etapa 1

- Base React/Vite/TypeScript.
- Tela inicial do painel admin em `/`, preparada para listar tutores.
- Widget de chat em `/widget/:tutorId`, preparado para uso dentro de um iframe.
- Cliente de API tipado para as rotas atuais do backend.

## Configuracao local

Crie um arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Variaveis disponiveis:

- `VITE_API_BASE_URL`: URL base do backend. Padrao: `http://localhost:8000`.
- `VITE_API_TOKEN`: token enviado no header `X-API-Token`. Padrao local: `dev-api-token`.

## Desenvolvimento

```bash
pnpm install
pnpm run dev
```

O app fica disponivel em `http://localhost:5173`.

Exemplos de rotas:

- Painel admin: `http://localhost:5173/`
- Widget iframe: `http://localhost:5173/widget/{tutor_id}`

## Widget embutivel

Use a rota `/widget/{tutor_id}` dentro de um iframe na pagina onde o chat deve aparecer.

```html
<iframe
  src="http://localhost:5173/widget/{tutor_id}"
  title="Chat com tutor DOT Interview"
  width="380"
  height="560"
  style="border: 0; border-radius: 8px;"
></iframe>
```

O widget carrega os dados do tutor antes da conversa, mostra o nome do tutor no cabecalho e bloqueia o envio de mensagens quando o tutor esta inativo.

## Validacao

```bash
pnpm run lint
pnpm run build
```
Repositório de frontend da solução de plataforma de tutores para entrevista na DOT Digital.
