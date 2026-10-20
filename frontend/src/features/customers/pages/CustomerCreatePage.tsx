import { CustomerForm } from '../components/CustomerForm';

export function CustomerCreatePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Nuevo cliente</h1>
      <CustomerForm />
    </div>
  );
}
