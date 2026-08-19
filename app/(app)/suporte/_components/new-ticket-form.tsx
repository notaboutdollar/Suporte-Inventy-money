import { createTicket } from "@/lib/actions/tickets";
import { CATEGORY_LABELS } from "@/lib/tickets";

export function NewTicketForm() {
  return (
    <div className="soft" style={{ background: "#ffffff", borderRadius: "var(--r-card)", padding: "var(--space-6)" }}>
      <h4 style={{ margin: "0 0 var(--space-4)" }}>Novo ticket</h4>
      <form action={createTicket} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
          <div className="field">
            <label htmlFor="telegram_handle">Telegram</label>
            <input className="input" id="telegram_handle" name="telegram_handle" type="text" placeholder="@usuario" />
          </div>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input className="input" id="email" name="email" type="email" placeholder="trainer@email.com" />
          </div>
        </div>

        <div className="field">
          <label htmlFor="category">Categoria</label>
          <select className="input" id="category" name="category" required defaultValue="">
            <option value="" disabled>
              Selecione
            </option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="description">Descrição</label>
          <textarea className="input" id="description" name="description" rows={3} required />
        </div>

        <button className="btn btn-primary" type="submit" style={{ alignSelf: "flex-start" }}>
          Criar ticket
        </button>
      </form>
    </div>
  );
}
