export default function TestPDFLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {children}
    </div>
  );
} 