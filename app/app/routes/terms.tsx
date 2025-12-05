import { useLanguage } from "../contexts/LanguageContext";

export function meta() {
  return [
    { title: "Termos e Condições - Walkys" },
    { name: "description", content: "Learn more about Walkys" },
  ];
}

export async function loader() {
  return null;
}

export const Terms = () => {
  const { t } = useLanguage();

  const sections = t.terms.sections as unknown as Array<{
    heading: string;
    paragraphs?: string[];
    listItems?: string[];
  }>;

  return (
    <main className="w-full min-h-screen bg-black flex justify-center items-start text-white py-36">
      <section className="max-w-3xl px-6">
        <h1 className="text-3xl font-semibold mb-4">{t.terms.title}</h1>

        <p className="mb-4">{t.terms.lastUpdated}</p>

        {sections.map((section, idx) => (
          <section className="mb-6" key={idx}>
            <h2 className="text-xl font-medium">{section.heading}</h2>
            {section.paragraphs?.map((p, i) => (
              <p className="mt-2" key={i}>
                {p}
              </p>
            ))}
            {section.listItems && (
              <ul className="list-disc ml-6 mt-2">
                {section.listItems.map((li, j) => (
                  <li key={j}>{li}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <p className="text-sm text-gray-300">{t.terms.note}</p>
      </section>
    </main>
  );
};

export default Terms;
