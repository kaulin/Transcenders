import type { ReactNode } from 'react';

export default function MainContainer({ children }: { children: ReactNode }) {
  return (
    <main className="max-w-4xl mx-auto p-4">
      {children}
    </main>
  );
}
