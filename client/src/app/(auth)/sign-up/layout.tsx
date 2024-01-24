export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <nav></nav>

      {children}
    </section>
  );
}
