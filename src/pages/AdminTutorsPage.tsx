import { useEffect, useState } from "react";
import { listTutors, type Tutor } from "../api/tutors";

export function AdminTutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listTutors()
      .then(setTutors)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="admin-shell">
      <section className="admin-header">
        <div>
          <p className="eyebrow">Painel admin</p>
          <h1>Tutores</h1>
        </div>
        <button type="button" className="primary-button">
          Novo tutor
        </button>
      </section>

      {isLoading && <p className="state-message">Carregando tutores...</p>}
      {error && <p className="state-message error">Erro ao carregar: {error}</p>}

      {!isLoading && !error && (
        <section className="table-wrap" aria-label="Lista de tutores">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Status</th>
                <th>Fontes</th>
                <th>Atualizado em</th>
              </tr>
            </thead>
            <tbody>
              {tutors.map((tutor) => (
                <tr key={tutor.id}>
                  <td>
                    <strong>{tutor.name}</strong>
                    <span>{tutor.description ?? "Sem descricao"}</span>
                  </td>
                  <td>{tutor.status === "ACTIVE" ? "Ativo" : "Inativo"}</td>
                  <td>{tutor.sources.length}</td>
                  <td>{new Date(tutor.updated_at).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {tutors.length === 0 && (
            <p className="state-message">Nenhum tutor cadastrado ainda.</p>
          )}
        </section>
      )}
    </main>
  );
}
