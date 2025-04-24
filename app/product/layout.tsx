import { Navbar } from 'components/layout/navbar';

export default function ProductLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
} 