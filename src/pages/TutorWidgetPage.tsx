import { FormEvent, useState } from "react";
import { sendTutorMessage } from "../api/tutors";

type ChatMessage = {
  id: string;
  author: "user" | "assistant";
  content: string;
};

type TutorWidgetPageProps = {
  tutorId: string | null;
};

export function TutorWidgetPage({ tutorId }: TutorWidgetPageProps) {
  const [message, setMessage] = useState("");
  const [sessionToken, setSessionToken] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!tutorId || !message.trim()) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      author: "user",
      content: message.trim(),
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setMessage("");
    setError(null);
    setIsSending(true);

    try {
      const response = await sendTutorMessage(tutorId, {
        message: userMessage.content,
        session_token: sessionToken,
      });

      setSessionToken(response.session_token);
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: response.session_id,
          author: "assistant",
          content: response.answer,
        },
      ]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Erro ao enviar mensagem.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="widget-shell">
      <header className="widget-header">
        <strong>DOT Interview</strong>
        <span>Assistente de entrevista</span>
      </header>

      <section className="messages" aria-live="polite">
        {!tutorId && (
          <p className="state-message error">Informe o tutor na URL do widget.</p>
        )}

        {messages.length === 0 && tutorId && (
          <p className="state-message">Envie uma pergunta para comecar.</p>
        )}

        {messages.map((chatMessage) => (
          <article
            className={`message-bubble ${chatMessage.author}`}
            key={chatMessage.id}
          >
            {chatMessage.content}
          </article>
        ))}

        {isSending && <p className="state-message">Gerando resposta...</p>}
        {error && <p className="state-message error">{error}</p>}
      </section>

      <form className="message-form" onSubmit={handleSubmit}>
        <input
          aria-label="Mensagem"
          disabled={!tutorId || isSending}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Digite sua pergunta"
          value={message}
        />
        <button disabled={!tutorId || isSending || !message.trim()} type="submit">
          Enviar
        </button>
      </form>
    </main>
  );
}
