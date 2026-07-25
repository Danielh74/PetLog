import type { ReactNode } from 'react';
import NavBar from './NavBar.tsx';

const AppLayout = ({ children }: { children: ReactNode }) => (
  <div className="app-layout">
    <NavBar />
    <main className="app-main">{children}</main>
  </div>
);

export default AppLayout;
