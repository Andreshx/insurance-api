export function Spinner() {
  return (
    <div className="flex justify-center py-12" role="status" aria-label="Cargando">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-primary" />
    </div>
  );
}
