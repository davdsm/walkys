import { useLanguage } from "~/contexts";

export function meta() {
    return [
        { title: "About - AskNicely" },
        { name: "description", content: "Learn more about AskNicely" },
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
