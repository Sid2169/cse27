export default function Loading() {
  return (
    <div className="page route-loading" role="status">
      <span className="loading-spinner" aria-hidden="true" />
      <h1>Loading page…</h1>
      <div className="loading-placeholder" aria-hidden="true" />
      <div className="loading-placeholder" aria-hidden="true" />
    </div>
  );
}
