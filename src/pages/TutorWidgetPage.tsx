import { FormEvent, useEffect, useRef, useState } from "react";
import { getTutor, sendTutorMessage, type Tutor } from "../api/tutors";

type ChatMessage = {
  id: string;
  author: "user" | "assistant";
  content: string;
};

type TutorWidgetPageProps = {
  tutorId: string | null;
};

function createMessage(author: ChatMessage["author"], content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    author,
    content,
  };
}

export function TutorWidgetPage({ tutorId }: TutorWidgetPageProps) {
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [message, setMessage] = useState("");
  const [sessionToken, setSessionToken] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingTutor, setIsLoadingTutor] = useState(Boolean(tutorId));
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isTutorActive = tutor?.status === "ACTIVE";
  const canSendMessage = Boolean(tutorId && isTutorActive && !isSending && message.trim());
  const inputPlaceholder = isTutorActive
    ? "Digite sua pergunta"
    : "Tutor indisponível para conversa";

  useEffect(() => {
    setTutor(null);
    setMessages([]);
    setSessionToken(undefined);

    if (!tutorId) {
      setIsLoadingTutor(false);
      return;
    }

    setIsLoadingTutor(true);
    setError(null);

    getTutor(tutorId)
      .then(setTutor)
      .catch((requestError) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Erro ao carregar tutor.",
        );
      })
      .finally(() => setIsLoadingTutor(false));
  }, [tutorId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSendMessage || !tutorId) {
      return;
    }

    const userMessage = createMessage("user", message.trim());

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
        createMessage("assistant", response.answer),
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Erro ao enviar mensagem.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="widget-shell">
      <header className="widget-header">
        <div>
          <strong>{tutor?.name ?? "DOT Interview"}</strong>
          <span>{tutor?.description ?? "Assistente de entrevista"}</span>
        </div>
        {tutor && (
          <span className={`widget-status ${tutor.status.toLowerCase()}`}>
            {isTutorActive ? "Online" : "Inativo"}
          </span>
        )}
      </header>

      <section className="messages" aria-live="polite">
        {!tutorId && (
          <p className="widget-notice error">Informe o tutor na URL do widget.</p>
        )}

        {isLoadingTutor && <p className="widget-notice">Carregando tutor...</p>}

        {!isLoadingTutor && tutor && !isTutorActive && (
          <p className="widget-notice error">
            Este tutor está inativo no momento.
          </p>
        )}

        {!isLoadingTutor && tutor && isTutorActive && messages.length === 0 && (
          <p className="widget-notice">
            Envie uma pergunta para iniciar a conversa.
          </p>
        )}

        {messages.map((chatMessage) => (
          <article
            className={`message-bubble ${chatMessage.author}`}
            key={chatMessage.id}
          >
            {chatMessage.content}
          </article>
        ))}

        {isSending && <p className="typing-state">Gerando resposta...</p>}
        {error && <p className="widget-notice error">{error}</p>}
        <div ref={messagesEndRef} />
      </section>

      <form className="message-form" onSubmit={handleSubmit}>
        <input
          aria-label="Mensagem"
          disabled={!tutorId || !isTutorActive || isSending}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={inputPlaceholder}
          value={message}
        />
        <button disabled={!canSendMessage} type="submit">
          Enviar
        </button>
      </form>
    </main>
  );
}
