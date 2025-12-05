import { useLanguage } from "~/contexts";

export function meta() {
  return [
    { title: "Walkys - About" },
    {
      name: "description",
      content:
        " The perfect footwear for all occasions. You can always expect from Walkys shoes a high standard of quality and comfort, with an updated design through the incorporation of new patterns and unique details. ",
    },
  ];
}

export default function About() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-white">{t.about.title}</p>
    </div>
  );
}
