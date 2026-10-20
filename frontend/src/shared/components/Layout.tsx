import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/customers', label: 'Clientes' },
  { to: '/policies', label: 'Pólizas' },
];

export function Layout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <NavLink to="/" className="font-display text-lg font-bold text-ink">
            Seguros<span className="text-primary">API</span>
          </NavLink>
          <nav className="flex gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-b-2 border-primary pb-0.5 text-primary'
                      : 'text-ink-soft hover:text-ink'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
