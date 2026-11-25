// A screen written before the design system, for the codemod check.
// Three elements convert safely; two need a person.
export function Legacy({ save, busy }: { save: () => void; busy: boolean }) {
  return (
    <div>
      <h2 id="title">Account</h2>
      <a href="https://help.example.com" target="_blank" rel="noreferrer">
        Help centre
      </a>
      <input type="email" />
      <button onClick={() => save()} disabled={busy}>
        Save
      </button>
      <button className="danger" onClick={(e) => e.stopPropagation()}>
        Delete
      </button>
    </div>
  );
}
