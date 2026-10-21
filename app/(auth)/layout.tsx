export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-black px-5 py-8 text-slate-900">
      {children}
    </main>
  );
}
