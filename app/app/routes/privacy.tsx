import { useLanguage } from "../contexts/LanguageContext";

export function meta() {
  return [
    { title: "Política de Privacidade - Walkys" },
    { name: "description", content: "Política de Privacidade da Walkys" },
  ];
}

export async function loader() {
  return null;
}

export const Privacy = () => {
  const { t } = useLanguage();

  const sections = (t.privacy.sections as unknown) as Array<{
    heading: string;
    paragraphs?: string[];
  }>;

  return (
    <main className="w-full min-h-screen bg-black flex justify-center items-start text-white py-36">
      <section className="max-w-3xl px-6">
        <h1 className="text-3xl font-semibold mb-4">{t.privacy.title}</h1>

        <p className="mb-4">{t.privacy.lastUpdated}</p>
        <p className="mb-6 text-gray-300">{t.privacy.introduction}</p>

        {sections.map((section, idx) => (
          <section className="mb-6" key={idx}>
            <h2 className="text-xl font-medium">{section.heading}</h2>
            {section.paragraphs?.map((p, i) => (
              <p className="mt-2" key={i}>
                {p}
              </p>
            ))}
          </section>
        ))}

        {/* Cookie specifics from translations */}
        <section className="mb-6">
          <h2 className="text-xl font-medium">{t.cookies.title}</h2>
          <h3 className="text-lg font-medium mt-2">{t.cookies.pocketbase.heading}</h3>
          {t.cookies.pocketbase.paragraphs.map((p: string, i: number) => (
            <p className="mt-2" key={i}>{p}</p>
          ))}
          <h3 className="text-lg font-medium mt-4">{t.cookies.general.heading}</h3>
          {t.cookies.general.paragraphs.map((p: string, i: number) => (
            <p className="mt-2" key={i}>{p}</p>
          ))}

          <p className="text-sm text-gray-300 mt-4">{t.cookies.note}</p>
        </section>
      </section>
    </main>
  );
};

export default Privacy;
