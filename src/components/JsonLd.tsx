/**
 * Renders a JSON-LD structured-data block. Server component — safe to place
 * anywhere in the App Router tree. `</script>`-closing sequences are escaped.
 */
export function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}