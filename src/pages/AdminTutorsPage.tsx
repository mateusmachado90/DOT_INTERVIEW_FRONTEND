import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createTutor,
  deleteTutor,
  listTutors,
  updateTutor,
  type Tutor,
  type TutorPayload,
  type TutorStatus,
} from "../api/tutors";

type TutorFormState = {
  name: string;
  description: string;
  status: TutorStatus;
  system_prompt: string;
};

const emptyForm: TutorFormState = {
  name: "",
  description: "",
  status: "ACTIVE",
  system_prompt: "",
};

function toFormState(tutor: Tutor): TutorFormState {
  return {
    name: tutor.name,
    description: tutor.description ?? "",
    status: tutor.status,
    system_prompt: tutor.system_prompt,
  };
}

function toPayload(form: TutorFormState): TutorPayload {
  return {
    name: form.name.trim(),
    description: form.description.trim() || null,
    status: form.status,
    system_prompt: form.system_prompt.trim(),
  };
}

export function AdminTutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null);
  const [form, setForm] = useState<TutorFormState>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedTutor = useMemo(
    () => tutors.find((tutor) => tutor.id === selectedTutorId) ?? null,
    [selectedTutorId, tutors],
  );

  const activeTutors = tutors.filter((tutor) => tutor.status === "ACTIVE").length;
  const inactiveTutors = tutors.length - activeTutors;
  const isEditing = Boolean(selectedTutor);

  useEffect(() => {
    refreshTutors();
  }, []);

  async function refreshTutors() {
    setIsLoading(true);
    setError(null);

    try {
      setTutors(await listTutors());
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Erro ao carregar tutores.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleNewTutor() {
    setSelectedTutorId(null);
    setForm(emptyForm);
    setFormError(null);
  }

  function handleEditTutor(tutor: Tutor) {
    setSelectedTutorId(tutor.id);
    setForm(toFormState(tutor));
    setFormError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const payload = toPayload(form);

    if (!payload.name || !payload.system_prompt) {
      setFormError("Preencha nome e prompt do sistema.");
      return;
    }

    setIsSaving(true);

    try {
      const savedTutor = selectedTutor
        ? await updateTutor(selectedTutor.id, payload)
        : await createTutor(payload);

      setTutors((currentTutors) => {
        if (selectedTutor) {
          return currentTutors.map((tutor) =>
            tutor.id === savedTutor.id ? savedTutor : tutor,
          );
        }

        return [savedTutor, ...currentTutors];
      });

      setSelectedTutorId(savedTutor.id);
      setForm(toFormState(savedTutor));
    } catch (requestError) {
      setFormError(
        requestError instanceof Error ? requestError.message : "Erro ao salvar tutor.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleStatus(tutor: Tutor) {
    const nextStatus: TutorStatus = tutor.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      const updatedTutor = await updateTutor(tutor.id, { status: nextStatus });
      setTutors((currentTutors) =>
        currentTutors.map((currentTutor) =>
          currentTutor.id === updatedTutor.id ? updatedTutor : currentTutor,
        ),
      );

      if (selectedTutorId === tutor.id) {
        setForm(toFormState(updatedTutor));
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Erro ao alterar status.",
      );
    }
  }

  async function handleDeleteTutor(tutor: Tutor) {
    const shouldDelete = window.confirm(`Excluir o tutor "${tutor.name}"?`);

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteTutor(tutor.id);
      setTutors((currentTutors) =>
        currentTutors.filter((currentTutor) => currentTutor.id !== tutor.id),
      );

      if (selectedTutorId === tutor.id) {
        handleNewTutor();
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Erro ao excluir tutor.",
      );
    }
  }

  return (
    <main className="admin-shell">
      <section className="admin-header">
        <div>
          <p className="eyebrow">Painel admin</p>
          <h1>Tutores</h1>
        </div>
        <button type="button" className="primary-button" onClick={handleNewTutor}>
          Novo tutor
        </button>
      </section>

      <section className="metrics-row" aria-label="Resumo de tutores">
        <div>
          <span>Total</span>
          <strong>{tutors.length}</strong>
        </div>
        <div>
          <span>Ativos</span>
          <strong>{activeTutors}</strong>
        </div>
        <div>
          <span>Inativos</span>
          <strong>{inactiveTutors}</strong>
        </div>
      </section>

      {isLoading && <p className="state-message">Carregando tutores...</p>}
      {error && <p className="state-message error">Erro: {error}</p>}

      {!isLoading && (
        <section className="admin-grid">
          <section className="table-wrap" aria-label="Lista de tutores">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Status</th>
                  <th>Fontes</th>
                  <th>Atualizado em</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {tutors.map((tutor) => (
                  <tr
                    className={selectedTutorId === tutor.id ? "selected-row" : ""}
                    key={tutor.id}
                  >
                    <td>
                      <strong>{tutor.name}</strong>
                      <span>{tutor.description ?? "Sem descricao"}</span>
                    </td>
                    <td>
                      <span className={`status-pill ${tutor.status.toLowerCase()}`}>
                        {tutor.status === "ACTIVE" ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td>{tutor.sources.length}</td>
                    <td>{new Date(tutor.updated_at).toLocaleDateString("pt-BR")}</td>
                    <td>
                      <div className="action-row">
                        <button type="button" onClick={() => handleEditTutor(tutor)}>
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(tutor)}
                        >
                          {tutor.status === "ACTIVE" ? "Inativar" : "Ativar"}
                        </button>
                        <button
                          className="danger-button"
                          type="button"
                          onClick={() => handleDeleteTutor(tutor)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {tutors.length === 0 && (
              <p className="state-message">Nenhum tutor cadastrado ainda.</p>
            )}
          </section>

          <aside className="editor-panel" aria-label="Formulario de tutor">
            <div className="editor-heading">
              <p className="eyebrow">{isEditing ? "Edicao" : "Cadastro"}</p>
              <h2>{isEditing ? "Editar tutor" : "Novo tutor"}</h2>
            </div>

            <form className="tutor-form" onSubmit={handleSubmit}>
              <label>
                Nome
                <input
                  maxLength={255}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Tutor Python"
                  value={form.name}
                />
              </label>

              <label>
                Descricao
                <textarea
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Resumo do objetivo deste tutor"
                  rows={3}
                  value={form.description}
                />
              </label>

              <label>
                Status
                <select
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      status: event.target.value as TutorStatus,
                    }))
                  }
                  value={form.status}
                >
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                </select>
              </label>

              <label>
                Prompt do sistema
                <textarea
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      system_prompt: event.target.value,
                    }))
                  }
                  placeholder="Voce e um tutor objetivo..."
                  rows={8}
                  value={form.system_prompt}
                />
              </label>

              {formError && <p className="state-message error">{formError}</p>}

              <div className="form-actions">
                <button className="primary-button" disabled={isSaving} type="submit">
                  {isSaving ? "Salvando..." : isEditing ? "Salvar" : "Criar tutor"}
                </button>
                <button type="button" onClick={handleNewTutor}>
                  Limpar
                </button>
              </div>
            </form>
          </aside>
        </section>
      )}
    </main>
  );
}
