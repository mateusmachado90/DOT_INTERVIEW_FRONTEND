# Decisao tecnica: comunicacao do chat

## Decisao

O widget de chat usa HTTP request/response para enviar mensagens ao backend.
O contrato atual e:

```http
POST /tutors/{tutor_id}/chat
```

Payload:

```json
{
  "message": "Explique o tema em poucas palavras.",
  "session_token": "token-opcional-para-continuar-a-conversa"
}
```

Resposta:

```json
{
  "session_id": "id-da-sessao",
  "session_token": "token-da-sessao",
  "answer": "Resposta do tutor."
}
```

## Motivos

- O backend ja fornece a rota HTTP de chat e a persistencia da sessao por
  `session_token`.
- O embed por iframe funciona bem com chamadas HTTP tradicionais feitas pelo
  proprio widget.
- O MVP nao exige streaming de tokens nem comunicacao bidirecional permanente.
- HTTP reduz complexidade de infraestrutura, reconexao, keepalive e tratamento
  de estados de socket.

## Trade-offs

- As respostas chegam completas, sem renderizacao incremental de tokens.
- Interacoes em tempo real, como presenca ou digitacao remota, exigiriam outro
  canal no futuro.
- Cada envio depende de uma requisicao HTTP completa.

## Quando reavaliar WebSocket

WebSocket passa a fazer sentido se o produto precisar de streaming de resposta,
eventos push do backend, multiplos participantes na mesma sessao ou baixa
latencia em interacoes continuas.
