export default function VerificarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-bone">{children}</div>;
}
