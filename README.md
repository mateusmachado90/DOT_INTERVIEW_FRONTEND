# DOT_INTERVIEW_FRONTEND

Frontend da solucao DOT Interview, construido com React, Vite e TypeScript.

## Nota sobre autoria

Este codigo foi produzido com o apoio de agentes de codificacao, nao por codificacao integralmente manual.

## Escopo da etapa 1

- Base React/Vite/TypeScript.
- Tela inicial do painel admin em `/`, preparada para listar tutores.
- Widget de chat em `/widget/:tutorId`, preparado para uso dentro de um iframe.
- Geracao de snippet de embed no painel admin para integracao em sites externos.
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

O fluxo principal para integradores e incorporar a rota `/widget/{tutor_id}`
dentro de um iframe no site de destino. No painel admin, clique em `Embed`
em um tutor para copiar a URL do widget, copiar o snippet HTML e testar o
iframe em uma demonstracao rapida dentro do proprio painel.

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
Cada iframe abre uma conversa independente e continua a sessao usando o
`session_token` retornado pelo backend enquanto a pagina do widget permanecer
aberta.

## Contrato de chat

O chat usa HTTP request/response contra `POST /tutors/{tutor_id}/chat`.
O widget envia `message` e, quando existir, `session_token`; o backend retorna
`answer`, `session_id` e `session_token` para continuar a conversa.

A escolha por HTTP favorece simplicidade, compatibilidade com iframe e menor
complexidade operacional no MVP. WebSocket fica como evolucao futura caso o
produto precise de streaming de tokens, eventos em tempo real ou colaboracao
simultanea.

## Validacao

```bash
pnpm run lint
pnpm run build
```
Repositório de frontend da solução de plataforma de tutores para entrevista na DOT Digital.
