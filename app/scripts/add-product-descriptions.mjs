/**
 * Assign a short, category-aware description (EN + PT) to every product that
 * doesn't have one yet (or to all, when FORCE=1 is passed).
 *
 * Each product gets a deterministic pick from a pool of opener + closer phrases
 * keyed by category, so descriptions feel varied without being templated. The
 * pick is derived from a hash of the product slug so results are stable across
 * re-runs.
 *
 * From directory `app/`:
 *   npm run products:add-descriptions
 *   FORCE=1 npm run products:add-descriptions           # overwrite existing copy
 *   DRY_RUN=1 npm run products:add-descriptions         # print without writing
 *   LIMIT=5 npm run products:add-descriptions           # only update first N
 *
 * Env (already in app/.env):
 *   POCKETBASE_URL | VITE_API_ENDPOINT    API base (default http://127.0.0.1:8090)
 *   API_PB_ADMIN_EMAIL / API_PB_ADMIN_PASSWORD
 */

import PocketBase from "pocketbase";

const PB_URL = (process.env.POCKETBASE_URL || process.env.VITE_API_ENDPOINT || "http://127.0.0.1:8090").replace(
    /\/$/,
    ""
);

const DRY = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";
const FORCE = process.env.FORCE === "1" || process.env.FORCE === "true";
const LIMIT = process.env.LIMIT ? Math.max(0, Number.parseInt(process.env.LIMIT, 10)) : 0;

const email = process.env.API_PB_ADMIN_EMAIL || process.env.PB_ADMIN_EMAIL || "";
const password = process.env.API_PB_ADMIN_PASSWORD || process.env.PB_ADMIN_PASSWORD || "";

/**
 * Pools of opener + closer sentences per category slug. Each final description
 * is `opener + " " + closer`, giving O(N*M) unique combinations per category.
 * Every closer mentions Portugal / handcraft so the brand story lands naturally.
 */
const EN = {
    default: {
        openers: [
            "Designed for the man who walks with intent.",
            "A quiet statement of modern masculinity.",
            "Created for the man who notices the details.",
            "For those who dress with confidence, not noise.",
            "An everyday classic, reinvented with care.",
            "Measured elegance for the contemporary gentleman.",
        ],
        closers: [
            "Handcrafted in Portugal from premium leathers.",
            "Made in Portugal with uncompromising craftsmanship.",
            "Cut and stitched by hand in our Portuguese atelier.",
            "Portuguese shoemaking, refined for today.",
            "Built in Portugal to be worn for years, not seasons.",
        ],
    },
    "semi-formal": {
        openers: [
            "Created for the man who moves between boardrooms and evenings with equal ease.",
            "Polished, refined, and quietly powerful.",
            "A reinvented classic for the contemporary gentleman.",
            "Tailored lines meet effortless comfort.",
            "Designed for the man who dresses with intention.",
            "Where heritage tailoring meets modern silhouette.",
        ],
        closers: [
            "Handcrafted in Portugal from full-grain leathers, built to command the room.",
            "Made in Portugal with the restraint and precision of old-world shoemaking.",
            "Portuguese craftsmanship, finished with details that only reveal themselves up close.",
            "Cut and lasted by hand in Portugal for a silhouette that only improves with wear.",
            "Portuguese atelier-made, for the man who understands that elegance is earned.",
        ],
    },
    casual: {
        openers: [
            "Versatile enough for any agenda, polished enough to be noticed.",
            "Relaxed in attitude, precise in construction.",
            "Designed for days that move fast but dress well.",
            "An everyday companion for the man who travels light.",
            "Effortless style for the man who has nothing to prove.",
            "Easy lines, quiet confidence.",
        ],
        closers: [
            "Handcrafted in Portugal with soft leathers that only get better with time.",
            "Made in Portugal to flex with you — weekday to weekend.",
            "Portuguese craftsmanship, built for the pace of modern life.",
            "Finished by hand in Portugal for a fit that feels broken-in from day one.",
            "Shaped in Portugal from premium hides, ready for wherever the day leads.",
        ],
    },
    running: {
        openers: [
            "Built for movement. Designed for the man who never stands still.",
            "Lightweight performance wrapped in everyday elegance.",
            "Engineered for kilometres, styled for the rest of the day.",
            "Dynamic lines for a life in motion.",
            "Speed, support, and a silhouette that belongs anywhere.",
            "Made for the modern commuter, the weekend runner, the restless traveller.",
        ],
        closers: [
            "Handcrafted in Portugal with cushioned soles and breathable uppers.",
            "Made in Portugal to keep pace without compromising on refinement.",
            "Portuguese shoemaking applied to a performance silhouette.",
            "Assembled in Portugal with lightweight construction and signature detailing.",
            "Built in Portugal for the man whose day doesn't slow down.",
        ],
    },
    sneakers: {
        openers: [
            "Modern lines for the man who writes his own rules.",
            "A contemporary silhouette that pairs with everything.",
            "Clean, considered, unmistakably contemporary.",
            "Urban minimalism, dressed up with Portuguese soul.",
            "For the man who treats sneakers as a finishing touch, not an afterthought.",
            "Understated architecture for loud cities.",
        ],
        closers: [
            "Handcrafted in Portugal from smooth premium leathers.",
            "Made in Portugal with the care usually reserved for dress shoes.",
            "Portuguese craftsmanship, translated to a modern sneaker silhouette.",
            "Cut and assembled by hand in Portugal for a clean, enduring finish.",
            "Built in Portugal to sit as confidently with denim as with tailoring.",
        ],
    },
    boots: {
        openers: [
            "Sturdy, confident, quietly assertive.",
            "A statement of craftsmanship, season after season.",
            "Built for the man who treats winter as an opportunity.",
            "Grounded construction for days that demand presence.",
            "Timeless silhouette, modern proportions.",
            "Where utility meets refinement.",
        ],
        closers: [
            "Handcrafted in Portugal from robust full-grain leathers.",
            "Made in Portugal to weather decades, not seasons.",
            "Portuguese craftsmanship, engineered to be lived in.",
            "Lasted by hand in Portugal for a silhouette that holds its line.",
            "Built in Portugal with the kind of soles that carry you further.",
        ],
    },
    botim: {
        openers: [
            "Ankle-height sophistication for the man who dresses with intent.",
            "Sharp, urban, unmistakably European.",
            "A silhouette that sits between refined and rugged.",
            "For the man who knows a boot can finish a look as well as it starts one.",
            "Measured proportions for a confident stride.",
            "Architectural lines, quietly masculine.",
        ],
        closers: [
            "Handcrafted in Portugal from supple leathers and precise stitching.",
            "Made in Portugal, finished with the details that make the difference.",
            "Portuguese shoemaking, shaped for city streets.",
            "Assembled by hand in Portugal for a silhouette that reads tailored.",
            "Built in Portugal to be paired with anything from denim to wool.",
        ],
    },
    mocassim: {
        openers: [
            "A loafer reimagined for the modern gentleman.",
            "Effortless slip-on refinement.",
            "Understated luxury, ready for the moment.",
            "Designed for the man who values time and makes it look easy.",
            "Where tradition meets contemporary ease.",
            "A silhouette that belongs on terraces and tarmac alike.",
        ],
        closers: [
            "Handcrafted in Portugal from the softest leathers we source.",
            "Made in Portugal with the patient craftsmanship a loafer deserves.",
            "Portuguese shoemaking, distilled to its most elegant form.",
            "Lasted by hand in Portugal for a fit that improves with every wear.",
            "Built in Portugal for the man who understands that less is, in fact, more.",
        ],
    },
};

const PT = {
    default: {
        openers: [
            "Pensado para o homem que caminha com intenção.",
            "Uma afirmação silenciosa de masculinidade moderna.",
            "Criado para o homem que repara nos detalhes.",
            "Para quem se veste com confiança e sem ruído.",
            "Um clássico do dia-a-dia, reinventado com cuidado.",
            "Elegância contida para o cavalheiro contemporâneo.",
        ],
        closers: [
            "Feito à mão em Portugal com peles de primeira.",
            "Produzido em Portugal com artesanato sem compromissos.",
            "Cortado e cosido à mão no nosso atelier português.",
            "Sapataria portuguesa, refinada para hoje.",
            "Construído em Portugal para durar anos, não estações.",
        ],
    },
    "semi-formal": {
        openers: [
            "Criado para o homem que transita entre salas de reunião e noites de cidade com a mesma à-vontade.",
            "Polido, refinado e silenciosamente poderoso.",
            "Um clássico reinventado para o cavalheiro contemporâneo.",
            "Linhas cuidadas que se encontram com conforto sem esforço.",
            "Pensado para o homem que se veste com intenção.",
            "Onde a alfaiataria de herança se encontra com a silhueta moderna.",
        ],
        closers: [
            "Feito à mão em Portugal em peles full-grain, pronto para impor presença.",
            "Produzido em Portugal com a precisão da sapataria de antigamente.",
            "Artesanato português, com acabamentos que só se revelam de perto.",
            "Cortado e formado à mão em Portugal para uma silhueta que melhora com o uso.",
            "Feito em atelier em Portugal, para quem percebe que a elegância é conquistada.",
        ],
    },
    casual: {
        openers: [
            "Versátil para qualquer agenda, polido o suficiente para se notar.",
            "Descontraído na atitude, preciso na construção.",
            "Desenhado para dias rápidos mas bem vestidos.",
            "Um companheiro do dia-a-dia para quem viaja leve.",
            "Estilo sem esforço para o homem que não tem nada a provar.",
            "Linhas fáceis, confiança silenciosa.",
        ],
        closers: [
            "Feito à mão em Portugal em peles macias que só melhoram com o tempo.",
            "Produzido em Portugal para acompanhar a semana inteira.",
            "Artesanato português construído para o ritmo da vida moderna.",
            "Acabado à mão em Portugal para um calce que parece já usado desde o primeiro dia.",
            "Modelado em Portugal em peles premium, pronto para onde o dia levar.",
        ],
    },
    running: {
        openers: [
            "Construído para o movimento. Desenhado para quem não pára.",
            "Performance leve embrulhada em elegância do dia-a-dia.",
            "Engenharia para quilómetros, estilo para o resto do dia.",
            "Linhas dinâmicas para uma vida em movimento.",
            "Velocidade, apoio e uma silhueta que entra em qualquer lado.",
            "Feito para o commuter moderno, o corredor de fim-de-semana, o viajante inquieto.",
        ],
        closers: [
            "Feito à mão em Portugal com solas almofadadas e gáspeas respiráveis.",
            "Produzido em Portugal para manter o ritmo sem abrir mão do refinamento.",
            "Sapataria portuguesa aplicada a uma silhueta de performance.",
            "Montado em Portugal com construção leve e detalhes de assinatura.",
            "Construído em Portugal para o homem cujo dia nunca abranda.",
        ],
    },
    sneakers: {
        openers: [
            "Linhas modernas para o homem que escreve as suas próprias regras.",
            "Uma silhueta contemporânea que combina com tudo.",
            "Limpo, pensado, inequivocamente contemporâneo.",
            "Minimalismo urbano com alma portuguesa.",
            "Para quem trata um sneaker como remate, não como descuido.",
            "Arquitetura discreta para cidades barulhentas.",
        ],
        closers: [
            "Feito à mão em Portugal em peles premium lisas.",
            "Produzido em Portugal com o cuidado normalmente reservado ao sapato clássico.",
            "Artesanato português traduzido para uma silhueta de sneaker moderna.",
            "Cortado e montado à mão em Portugal para um acabamento limpo e duradouro.",
            "Construído em Portugal para combinar tanto com ganga como com alfaiataria.",
        ],
    },
    boots: {
        openers: [
            "Robusto, confiante, silenciosamente afirmativo.",
            "Uma afirmação de artesanato, estação após estação.",
            "Construído para o homem que encara o inverno como oportunidade.",
            "Construção sólida para dias que exigem presença.",
            "Silhueta intemporal, proporções modernas.",
            "Onde a utilidade encontra o refinamento.",
        ],
        closers: [
            "Feito à mão em Portugal em peles full-grain robustas.",
            "Produzido em Portugal para atravessar décadas, não estações.",
            "Artesanato português, pensado para ser vivido.",
            "Formado à mão em Portugal para uma silhueta que mantém a linha.",
            "Construído em Portugal com solas que levam mais longe.",
        ],
    },
    botim: {
        openers: [
            "Sofisticação de altura média para o homem que se veste com intenção.",
            "Afiado, urbano, inequivocamente europeu.",
            "Uma silhueta entre o refinado e o robusto.",
            "Para quem sabe que um botim fecha um look tão bem como o abre.",
            "Proporções medidas para um andar confiante.",
            "Linhas arquitetónicas, discretamente masculinas.",
        ],
        closers: [
            "Feito à mão em Portugal em peles flexíveis com costuras precisas.",
            "Produzido em Portugal, com os detalhes que fazem a diferença.",
            "Sapataria portuguesa moldada para a cidade.",
            "Montado à mão em Portugal para uma silhueta com leitura alfaiate.",
            "Construído em Portugal para combinar tanto com ganga como com lã.",
        ],
    },
    mocassim: {
        openers: [
            "Um mocassim reimaginado para o cavalheiro moderno.",
            "Refinamento slip-on sem esforço.",
            "Luxo discreto, pronto para o momento.",
            "Pensado para o homem que valoriza o tempo e faz com que pareça fácil.",
            "Onde a tradição encontra a facilidade contemporânea.",
            "Uma silhueta à vontade em esplanadas e em pistas de aeroporto.",
        ],
        closers: [
            "Feito à mão em Portugal nas peles mais macias que conseguimos obter.",
            "Produzido em Portugal com o artesanato paciente que um mocassim merece.",
            "Sapataria portuguesa destilada na sua forma mais elegante.",
            "Formado à mão em Portugal para um calce que melhora a cada uso.",
            "Construído em Portugal para o homem que percebe que menos é, de facto, mais.",
        ],
    },
};

function hashString(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
}

function pickDescription(pools, slug, categorySlug) {
    const pool = pools[categorySlug] || pools.default;
    const fallback = pools.default;
    const openers = [...pool.openers, ...fallback.openers];
    const closers = [...pool.closers, ...fallback.closers];
    const h1 = hashString(`${slug}::opener`);
    const h2 = hashString(`${slug}::closer`);
    return `${openers[h1 % openers.length]} ${closers[h2 % closers.length]}`;
}

async function adminAuth(pb) {
    if (typeof pb.admins?.authWithPassword === "function") {
        await pb.admins.authWithPassword(email, password);
    } else {
        await pb.collection("_superusers").authWithPassword(email, password);
    }
}

async function main() {
    if (!email || !password) {
        console.error("Missing API_PB_ADMIN_EMAIL / API_PB_ADMIN_PASSWORD env.");
        process.exit(1);
    }

    const pb = new PocketBase(PB_URL);
    pb.autoCancellation(false);

    console.log(`PB_URL: ${PB_URL}`);
    console.log(`FORCE=${FORCE ? "yes" : "no"} DRY_RUN=${DRY ? "yes" : "no"} LIMIT=${LIMIT || "none"}`);

    try {
        await adminAuth(pb);
    } catch (err) {
        console.error("Superuser auth failed:", err?.message || err);
        process.exit(1);
    }

    const cats = await pb.collection("category").getFullList({ fields: "id,slug" });
    const catSlugById = new Map(cats.map((c) => [c.id, c.slug]));

    const products = await pb.collection("products").getFullList({
        fields: "id,slug,name_en,name_pt,category,description_en,description_pt",
        batch: 200,
        sort: "+slug",
    });

    console.log(`Found ${products.length} product record(s).`);

    const queue = products.filter((p) => {
        if (FORCE) return true;
        const enEmpty = !p.description_en || !String(p.description_en).trim();
        const ptEmpty = !p.description_pt || !String(p.description_pt).trim();
        return enEmpty || ptEmpty;
    });

    console.log(`${queue.length} product(s) need description(s).`);

    const runList = LIMIT > 0 ? queue.slice(0, LIMIT) : queue;
    let updated = 0;
    let failed = 0;

    for (const p of runList) {
        const categoryId = Array.isArray(p.category) ? p.category[0] : p.category;
        const categorySlug = catSlugById.get(categoryId) || "default";
        const descEn = pickDescription(EN, p.slug || p.id, categorySlug);
        const descPt = pickDescription(PT, p.slug || p.id, categorySlug);

        const payload = {};
        if (FORCE || !p.description_en || !String(p.description_en).trim()) payload.description_en = descEn;
        if (FORCE || !p.description_pt || !String(p.description_pt).trim()) payload.description_pt = descPt;

        if (Object.keys(payload).length === 0) continue;

        const label = `[${categorySlug}] ${p.slug}`;

        if (DRY) {
            console.log(`  ~ would update ${label}`);
            if (payload.description_en) console.log(`      EN: ${payload.description_en}`);
            if (payload.description_pt) console.log(`      PT: ${payload.description_pt}`);
            continue;
        }

        try {
            await pb.collection("products").update(p.id, payload);
            updated += 1;
            console.log(`  + ${label}`);
        } catch (err) {
            failed += 1;
            const msg = err?.response?.data
                ? `${err.message} :: ${JSON.stringify(err.response.data)}`
                : err?.message || String(err);
            console.warn(`  ! failed ${label} — ${msg}`);
        }
    }

    console.log(
        `\nSummary: updated=${updated}, failed=${failed}, queued=${runList.length}, dry-run=${DRY}, force=${FORCE}`
    );
    if (failed > 0) process.exit(1);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
