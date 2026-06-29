/**
 * Skeleton placeholder shown while lazy-loaded pages are being fetched.
 * Prevents CLS by reserving vertical space.
 */
function PageSkeleton() {
  return (
    <div style={{ padding: "32px" }}>
      <div
        style={{
          width: "200px",
          height: "28px",
          background: "var(--gris-borde)",
          borderRadius: "6px",
          marginBottom: "24px",
        }}
      />
      <div
        style={{
          width: "100%",
          height: "120px",
          background: "var(--gris-borde)",
          borderRadius: "var(--radius)",
          marginBottom: "20px",
          opacity: 0.6,
        }}
      />
      <div
        style={{
          width: "100%",
          height: "300px",
          background: "var(--gris-borde)",
          borderRadius: "var(--radius)",
          opacity: 0.4,
        }}
      />
    </div>
  );
}

export default PageSkeleton;
