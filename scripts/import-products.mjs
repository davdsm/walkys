import fs from "node:fs";
import path from "node:path";

const PB_URL = "http://127.0.0.1:8090";
const ADMIN_EMAIL = "hello@walkys.com";
const ADMIN_PASSWORD = "123123123";

const PRODUTOS_DIR = path.resolve(import.meta.dirname, "..", "produtos");

const COLLECTION_ID = "l94xcjg14h0no3k"; // Outono / Inverno

// Category IDs
const CAT_SEMI_FORMAL = "rynchipdpqxb4p3";
const CAT_BOOTS = "q6jwi0ocf687wfr";
const CAT_SNEAKERS = "7o2n6i1u3eppj29";
const CAT_CASUAL = "g31bjadji88sjl2";
const CAT_RUNNING = "tt1my7wkq3pl2af";

// Homepage section record IDs
const HOMEPAGE_INTRO_PRODUCT_ID = "1198c7ozgik32gg";
const HOMEPAGE_SLIDER_LIST_ID = "6jds0eqr80l5o3w";

const CATEGORY_DESCRIPTIONS = [
  {
    id: CAT_RUNNING,
    description_pt: "Inspiradas no desporto e pensadas para o conforto diário. As nossas sapatilhas runner combinam solas técnicas com pele e camurça premium, fabricadas em Portugal.",
    description_en: "Sport-inspired and built for everyday comfort. Our runner sneakers pair technical soles with premium leather and suede, handcrafted in Portugal.",
  },
  {
    id: CAT_SEMI_FORMAL,
    description_pt: "Elegância clássica com toque contemporâneo. Os nossos sapatos semi formais em pele portuguesa são perfeitos para o escritório ou uma ocasião especial.",
    description_en: "Classic elegance with a contemporary touch. Our semi-formal leather shoes are handcrafted in Portugal, perfect for the office or a special occasion.",
  },
  {
    id: CAT_CASUAL,
    description_pt: "Versatilidade e estilo para o dia a dia. Os nossos sapatos casual combinam pele premium com solas modernas, feitos em Portugal com atenção ao detalhe.",
    description_en: "Versatility and style for everyday life. Our casual shoes combine premium leather with modern soles, made in Portugal with attention to detail.",
  },
  {
    id: CAT_SNEAKERS,
    description_pt: "Design urbano e conforto superior. As nossas sneakers em pele e camurça são fabricadas em Portugal para quem valoriza qualidade e atitude.",
    description_en: "Urban design and superior comfort. Our leather and suede sneakers are handcrafted in Portugal for those who value quality and attitude.",
  },
];

const PRODUCTS_TO_IMPORT = [
  // ── Semi Formal ──
  {
    folder: "1023",
    category: CAT_SEMI_FORMAL,
    description_pt: "Criado para o homem que domina cada sala. Um clássico reinventado, pensado nos pormenores da elegância contemporânea.",
    description_en: "Created for the man who commands every room. A reinvented classic, designed with attention to the details of contemporary elegance.",
  },
  {
    folder: "1023 2",
    category: CAT_SEMI_FORMAL,
    description_pt: "Para quem encontra sofisticação nos detalhes. Pensado para o homem que veste com intenção e caminha com confiança.",
    description_en: "For those who find sophistication in the details. Designed for the man who dresses with intention and walks with confidence.",
  },
  {
    folder: "128",
    category: CAT_SEMI_FORMAL,
    description_pt: "Um essencial para o homem clássico. Distinção natural para quem valoriza a tradição sem abdicar do conforto moderno.",
    description_en: "An essential for the classic man. Natural distinction for those who value tradition without compromising modern comfort.",
  },
  {
    folder: "128 2",
    category: CAT_SEMI_FORMAL,
    description_pt: "Presença discreta, impacto duradouro. Criado para os momentos que pedem elegância sem esforço.",
    description_en: "Understated presence, lasting impact. Created for moments that call for effortless elegance.",
  },
  {
    folder: "361",
    category: CAT_SEMI_FORMAL,
    description_pt: "Para o homem que faz da elegância um hábito. Sobriedade e carácter para o dia a dia profissional.",
    description_en: "For the man who makes elegance a habit. Sobriety and character for everyday professional life.",
  },
  {
    folder: "541",
    category: CAT_SEMI_FORMAL,
    description_pt: "Criado para ocasiões que exigem presença. O companheiro do homem que se veste para conquistar.",
    description_en: "Created for occasions that demand presence. The companion of the man who dresses to make an impression.",
  },
  {
    folder: "626",
    category: CAT_SEMI_FORMAL,
    description_pt: "Linhas puras para o homem decidido. Elegância intemporal que acompanha cada passo com segurança.",
    description_en: "Pure lines for the decisive man. Timeless elegance that accompanies every step with confidence.",
  },
  {
    folder: "626 2",
    category: CAT_SEMI_FORMAL,
    description_pt: "Carácter e refinamento para o homem contemporâneo. Um tom quente que revela personalidade sem exageros.",
    description_en: "Character and refinement for the contemporary man. A warm tone that reveals personality without excess.",
  },
  {
    folder: "726",
    category: CAT_SEMI_FORMAL,
    description_pt: "Sobriedade com um toque de ousadia. Para o homem que equilibra tradição e modernidade em cada detalhe.",
    description_en: "Sobriety with a touch of boldness. For the man who balances tradition and modernity in every detail.",
  },
  {
    folder: "726 2",
    category: CAT_SEMI_FORMAL,
    description_pt: "Sofisticação que se sente a cada passo. Pensado para o homem que valoriza o que é feito para durar.",
    description_en: "Sophistication you feel with every step. Designed for the man who values what is made to last.",
  },
  {
    folder: "879",
    category: CAT_SEMI_FORMAL,
    description_pt: "Elegância discreta para o homem seguro de si. Linhas clássicas que falam por si mesmas.",
    description_en: "Understated elegance for the self-assured man. Classic lines that speak for themselves.",
  },
  {
    folder: "879 2",
    category: CAT_SEMI_FORMAL,
    description_pt: "Versatilidade com alma. Do escritório ao jantar, para o homem que não compromete o estilo.",
    description_en: "Versatility with soul. From the office to dinner, for the man who never compromises on style.",
  },
  {
    folder: "905",
    category: CAT_SEMI_FORMAL,
    description_pt: "Um intemporal no guarda-roupa masculino. Criado para o homem que sabe que a verdadeira elegância é silenciosa.",
    description_en: "A timeless piece in the male wardrobe. Created for the man who knows that true elegance is quiet.",
  },
  {
    folder: "905 2",
    category: CAT_SEMI_FORMAL,
    description_pt: "Perfeição nos pormenores para cada ocasião. O parceiro do homem que se apresenta sempre impecável.",
    description_en: "Perfection in the details for every occasion. The partner of the man who always presents himself impeccably.",
  },
  {
    folder: "905 3",
    category: CAT_SEMI_FORMAL,
    description_pt: "Presença distinta com tom acolhedor. Para o homem que alia confiança a um estilo próprio e marcante.",
    description_en: "Distinct presence with a warm tone. For the man who combines confidence with a personal and striking style.",
  },
  {
    folder: "921",
    category: CAT_SEMI_FORMAL,
    description_pt: "Carácter vivido para o homem com história. Uma peça que ganha personalidade com o tempo, tal como quem a usa.",
    description_en: "Lived-in character for the man with a story. A piece that gains personality over time, just like the one who wears it.",
  },

  // ── Boots ──
  {
    folder: "422LP",
    category: CAT_BOOTS,
    description_pt: "Para o homem urbano que não abdica do conforto. Atitude e presença para enfrentar qualquer dia com estilo.",
    description_en: "For the urban man who never gives up comfort. Attitude and presence to face any day with style.",
  },
  {
    folder: "422LP 2",
    category: CAT_BOOTS,
    description_pt: "Espírito contemporâneo para o homem que se move com propósito. Feito para acompanhar o ritmo da cidade.",
    description_en: "Contemporary spirit for the man who moves with purpose. Made to keep up with the rhythm of the city.",
  },
  {
    folder: "619",
    category: CAT_BOOTS,
    description_pt: "Robustez com alma elegante. Para o homem que conquista o dia com firmeza e classe natural.",
    description_en: "Ruggedness with an elegant soul. For the man who conquers the day with firmness and natural class.",
  },
  {
    folder: "619 2",
    category: CAT_BOOTS,
    description_pt: "Versatilidade para o homem que transita entre mundos. Do casual ao sofisticado sem perder a identidade.",
    description_en: "Versatility for the man who moves between worlds. From casual to sophisticated without losing his identity.",
  },
  {
    folder: "619 3",
    category: CAT_BOOTS,
    description_pt: "Sofisticação discreta para o homem que valoriza cada detalhe. Conforto e elegância em perfeito equilíbrio.",
    description_en: "Quiet sophistication for the man who values every detail. Comfort and elegance in perfect balance.",
  },
  {
    folder: "619 4",
    category: CAT_BOOTS,
    description_pt: "Tons quentes para o homem com personalidade. Criado para quem vive com intensidade e se veste com intenção.",
    description_en: "Warm tones for the man with personality. Created for those who live with intensity and dress with intention.",
  },
  {
    folder: "951-A",
    category: CAT_BOOTS,
    description_pt: "Elegância sem esforço para o homem moderno. A silhueta perfeita para quem valoriza o tempo e o estilo.",
    description_en: "Effortless elegance for the modern man. The perfect silhouette for those who value time and style.",
  },

  // ── Sneakers ──
  {
    folder: "1042",
    category: CAT_SNEAKERS,
    description_pt: "Para o homem que combina energia e estilo. Atitude descontraída para quem não segue tendências — cria-as.",
    description_en: "For the man who combines energy and style. Laid-back attitude for those who don't follow trends — they set them.",
  },
  {
    folder: "824",
    category: CAT_SNEAKERS,
    description_pt: "Estilo urbano para o homem que vive a cidade com personalidade. Conforto e carácter do amanhecer ao anoitecer.",
    description_en: "Urban style for the man who lives the city with personality. Comfort and character from dawn to dusk.",
  },
  {
    folder: "824 2",
    category: CAT_SNEAKERS,
    description_pt: "Minimalismo com atitude. Para o homem que encontra força na simplicidade e elegância no essencial.",
    description_en: "Minimalism with attitude. For the man who finds strength in simplicity and elegance in the essential.",
  },

  // ── Casual ──
  {
    folder: "568",
    category: CAT_CASUAL,
    description_pt: "Leveza e estilo para o homem moderno. Pensado para os dias que pedem conforto sem abdicar da elegância.",
    description_en: "Lightness and style for the modern man. Designed for days that call for comfort without sacrificing elegance.",
  },
  {
    folder: "568-T",
    category: CAT_CASUAL,
    description_pt: "Para o dia a dia do homem versátil. Descontração com classe, do brunch ao passeio ao fim da tarde.",
    description_en: "For the everyday life of the versatile man. Relaxation with class, from brunch to an evening stroll.",
  },
  {
    folder: "879-L",
    category: CAT_CASUAL,
    description_pt: "Design limpo para o homem que aprecia a simplicidade. Conforto leve para viver cada momento com estilo.",
    description_en: "Clean design for the man who appreciates simplicity. Lightweight comfort to live every moment with style.",
  },
  {
    folder: "879-L 2",
    category: CAT_CASUAL,
    description_pt: "Um tom diferente para o homem que ousa. Sofisticação discreta que não passa despercebida.",
    description_en: "A different tone for the man who dares. Understated sophistication that doesn't go unnoticed.",
  },
  {
    folder: "988",
    category: CAT_CASUAL,
    description_pt: "Espírito livre para o homem aventureiro. Cor e personalidade para quem vive com ousadia e autenticidade.",
    description_en: "Free spirit for the adventurous man. Colour and personality for those who live with boldness and authenticity.",
  },

  // ── Previous batch: Boots ──
  {
    folder: "1044-MT",
    category: CAT_BOOTS,
    description_pt: "Para os dias frios do homem que não fica em casa. Conforto e proteção com a elegância de quem sabe onde quer chegar.",
    description_en: "For the cold days of the man who doesn't stay home. Comfort and protection with the elegance of someone who knows where he's going.",
  },
  {
    folder: "1044-MT 2",
    category: CAT_BOOTS,
    description_pt: "Presença marcante para o homem destemido. Feito para enfrentar o inverno com atitude e confiança.",
    description_en: "Bold presence for the fearless man. Made to face winter with attitude and confidence.",
  },
  {
    folder: "1137",
    category: CAT_BOOTS,
    description_pt: "Casual com sofisticação. Para o homem que eleva o quotidiano com gestos simples e estilo apurado.",
    description_en: "Casual with sophistication. For the man who elevates the everyday with simple gestures and refined style.",
  },
  {
    folder: "1137 2",
    category: CAT_BOOTS,
    description_pt: "Carácter e qualidade para o homem que valoriza o que é autêntico. Personalidade em cada passo.",
    description_en: "Character and quality for the man who values what is authentic. Personality in every step.",
  },
  {
    folder: "1209",
    category: CAT_BOOTS,
    description_pt: "Leveza e elegância para a meia-estação. Para o homem que aprecia a transição com estilo natural.",
    description_en: "Lightness and elegance for the transitional season. For the man who appreciates the transition with natural style.",
  },
  {
    folder: "1209 2",
    category: CAT_BOOTS,
    description_pt: "Um tom diferente para o homem que se destaca. Sofisticação discreta para quem caminha ao seu próprio ritmo.",
    description_en: "A different tone for the man who stands out. Understated sophistication for those who walk to their own rhythm.",
  },
  {
    folder: "1224",
    category: CAT_BOOTS,
    description_pt: "Determinação e estilo para o homem que não recua. Presença firme para dias que exigem o melhor de nós.",
    description_en: "Determination and style for the man who never backs down. Firm presence for days that demand the best of us.",
  },
  {
    folder: "1224 2",
    category: CAT_BOOTS,
    description_pt: "Resistência com elegância. Para o homem que combina força interior com um exterior impecável.",
    description_en: "Durability with elegance. For the man who combines inner strength with an impeccable exterior.",
  },
  {
    folder: "850-A",
    category: CAT_BOOTS,
    description_pt: "Proteção e conforto para o homem que abraça o frio. Feito para os dias que pedem coragem e estilo.",
    description_en: "Protection and comfort for the man who embraces the cold. Made for days that call for courage and style.",
  },
  {
    folder: "850-A 2",
    category: CAT_BOOTS,
    description_pt: "Carácter e durabilidade para o homem que vive com intensidade. Cada dia é uma aventura com presença.",
    description_en: "Character and durability for the man who lives with intensity. Every day is an adventure with presence.",
  },

  // ── Previous batch: Sneakers ──
  {
    folder: "1059",
    category: CAT_SNEAKERS,
    description_pt: "Atitude urbana para o homem que faz as suas próprias regras. Estilo destemido do amanhecer ao anoitecer.",
    description_en: "Urban attitude for the man who makes his own rules. Fearless style from dawn to dusk.",
  },
  {
    folder: "1059 2",
    category: CAT_SNEAKERS,
    description_pt: "Para o homem que vive a cidade com personalidade. Conforto e carácter para cada momento do dia.",
    description_en: "For the man who lives the city with personality. Comfort and character for every moment of the day.",
  },
  {
    folder: "1131",
    category: CAT_SNEAKERS,
    description_pt: "Espírito desportivo com toque premium. Para quem quer ir mais longe sem abdicar do estilo.",
    description_en: "Sporty spirit with a premium touch. For those who want to go further without giving up style.",
  },
  {
    folder: "1164",
    category: CAT_SNEAKERS,
    description_pt: "Pureza de linhas para o homem que valoriza o essencial. Design contemporâneo para espíritos limpos.",
    description_en: "Purity of lines for the man who values the essential. Contemporary design for clear minds.",
  },
  {
    folder: "1164 2",
    category: CAT_SNEAKERS,
    description_pt: "Elegância discreta para o dia a dia. Para o homem que encontra luxo na simplicidade.",
    description_en: "Understated elegance for everyday life. For the man who finds luxury in simplicity.",
  },
  {
    folder: "1172",
    category: CAT_SNEAKERS,
    description_pt: "Versatilidade para o homem que não se define por um só estilo. Conforto e presença em qualquer ocasião.",
    description_en: "Versatility for the man who isn't defined by a single style. Comfort and presence on any occasion.",
  },
  {
    folder: "1172 2",
    category: CAT_SNEAKERS,
    description_pt: "Para o homem que mistura mundos com naturalidade. Conforto diário com um toque de distinção.",
    description_en: "For the man who blends worlds with ease. Daily comfort with a touch of distinction.",
  },
  {
    folder: "1187",
    category: CAT_SNEAKERS,
    description_pt: "Estilo urbano para quem procura conforto com atitude. Pensado para o homem que marca presença onde quer que vá.",
    description_en: "Urban style for those seeking comfort with attitude. Designed for the man who makes his presence felt wherever he goes.",
  },
  {
    folder: "1187 2",
    category: CAT_SNEAKERS,
    description_pt: "Presença marcante para o homem com visão. Qualidade premium para quem exige o melhor de si e do que veste.",
    description_en: "Bold presence for the man with vision. Premium quality for those who demand the best from themselves and what they wear.",
  },

  // ── Previous batch: Casual ──
  {
    folder: "1077",
    category: CAT_CASUAL,
    description_pt: "Elegância e conforto para o homem moderno. Pensado para os dias que pedem leveza e sofisticação.",
    description_en: "Elegance and comfort for the modern man. Designed for days that call for lightness and sophistication.",
  },
  {
    folder: "1077 2",
    category: CAT_CASUAL,
    description_pt: "Leveza com sofisticação para o homem que vive sem pressas. Estilo que acompanha cada momento com naturalidade.",
    description_en: "Lightness with sophistication for the man who lives without rush. Style that accompanies every moment with ease.",
  },

  // ── Running ──
  {
    folder: "1098",
    category: CAT_RUNNING,
    description_pt: "Para o homem em movimento que não sacrifica o estilo. Energia e sofisticação para cada passo do dia.",
    description_en: "For the man in motion who never sacrifices style. Energy and sophistication for every step of the day.",
  },
  {
    folder: "1098 2",
    category: CAT_RUNNING,
    description_pt: "Dinamismo com elegância. Pensado para o homem ativo que quer ir mais longe sem perder a classe.",
    description_en: "Dynamism with elegance. Designed for the active man who wants to go further without losing his class.",
  },
  {
    folder: "1173",
    category: CAT_RUNNING,
    description_pt: "Conforto em movimento para o homem contemporâneo. Feito para acompanhar o ritmo de quem não pára.",
    description_en: "Comfort in motion for the contemporary man. Made to keep up with those who never stop.",
  },
  {
    folder: "1173 2",
    category: CAT_RUNNING,
    description_pt: "Funcionalidade e design para o homem moderno. Para quem vive a cidade com pressa mas sem descurar o estilo.",
    description_en: "Functionality and design for the modern man. For those who live the city in a rush but never neglect style.",
  },
  {
    folder: "1177",
    category: CAT_RUNNING,
    description_pt: "Força e carácter para o homem que enfrenta cada dia com determinação. Estilo robusto para espíritos urbanos.",
    description_en: "Strength and character for the man who faces each day with determination. Rugged style for urban spirits.",
  },
  {
    folder: "1177 2",
    category: CAT_RUNNING,
    description_pt: "Presença desportiva com toque elegante. Para o homem que transita entre o casual e o sofisticado com naturalidade.",
    description_en: "Sporty presence with an elegant touch. For the man who transitions between casual and sophisticated with ease.",
  },
  {
    folder: "1200",
    category: CAT_RUNNING,
    description_pt: "Perfil clássico para o homem que corre atrás dos seus sonhos. Conforto e estilo que inspiram confiança.",
    description_en: "Classic profile for the man who chases his dreams. Comfort and style that inspire confidence.",
  },
  {
    folder: "1200 2",
    category: CAT_RUNNING,
    description_pt: "Tons neutros para o homem versátil. Uma base sólida de estilo para qualquer destino do dia.",
    description_en: "Neutral tones for the versatile man. A solid style foundation for any destination of the day.",
  },
];

function fileToBlob(filePath) {
  const buffer = fs.readFileSync(filePath);
  return new File([buffer], path.basename(filePath), { type: "image/jpeg" });
}

async function authenticate() {
  const res = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Auth failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.token;
}

async function fetchSizeIds(token) {
  const res = await fetch(`${PB_URL}/api/collections/sizes/records?perPage=50&sort=number`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Fetch sizes failed: ${res.status}`);
  const data = await res.json();
  return data.items
    .filter((s) => {
      const n = parseInt(s.number, 10);
      return !Number.isNaN(n) && n >= 35 && n <= 47;
    })
    .map((s) => s.id);
}

async function fetchExistingProducts(token) {
  const res = await fetch(`${PB_URL}/api/collections/products/records?perPage=200&fields=id,name_pt`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { names: new Set(), ids: [] };
  const data = await res.json();
  const names = new Set(data.items.map((i) => i.name_pt));
  const ids = data.items.map((i) => i.id);
  return { names, ids };
}

async function createProduct(token, formData) {
  const res = await fetch(`${PB_URL}/api/collections/products/records`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Create failed: ${res.status} ${JSON.stringify(body, null, 2)}`);
  return body;
}

async function updateCategoryDescriptions(token) {
  for (const cat of CATEGORY_DESCRIPTIONS) {
    const res = await fetch(`${PB_URL}/api/collections/pbc_1174553048/records/${cat.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ description_pt: cat.description_pt, description_en: cat.description_en }),
    });
    const data = await res.json();
    console.log(`  ${data.name_pt ?? cat.id}: ${res.ok ? "updated" : "failed"}`);
  }
}

async function updateProductDescriptions(token) {
  const descMap = new Map(PRODUCTS_TO_IMPORT.map((p) => [p.folder, p]));
  const res = await fetch(`${PB_URL}/api/collections/products/records?perPage=200&fields=id,name_pt`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return;
  const data = await res.json();
  let updated = 0;
  for (const item of data.items) {
    const product = descMap.get(item.name_pt);
    if (!product) continue;
    const r = await fetch(`${PB_URL}/api/collections/products/records/${item.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ description_pt: product.description_pt, description_en: product.description_en }),
    });
    if (r.ok) updated++;
    console.log(`  ${item.name_pt}: ${r.ok ? "updated" : "failed"}`);
  }
  return updated;
}

async function updateHomepageData(token, productIds) {
  const heroProductId = productIds[0];
  const sliderIds = productIds.slice(0, 6);

  const r1 = await fetch(`${PB_URL}/api/collections/Homepage/records/${HOMEPAGE_INTRO_PRODUCT_ID}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ products: [heroProductId] }),
  });
  console.log(`  intro-product: ${r1.ok ? "updated" : "failed"}`);

  const r2 = await fetch(`${PB_URL}/api/collections/Homepage/records/${HOMEPAGE_SLIDER_LIST_ID}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ products: sliderIds }),
  });
  console.log(`  slider-products-list: ${r2.ok ? "updated"  : "failed"}`);
}

async function main() {
  console.log("Authenticating as admin...");
  const token = await authenticate();
  console.log("Authenticated.\n");

  console.log("Fetching sizes (35-47)...");
  const sizeIds = await fetchSizeIds(token);
  console.log(`Found ${sizeIds.length} sizes.\n`);

  console.log("Updating category descriptions...");
  await updateCategoryDescriptions(token);
  console.log("");

  console.log("Updating descriptions of existing products...");
  const descUpdated = await updateProductDescriptions(token);
  console.log(`Updated ${descUpdated} product descriptions.\n`);

  console.log("Fetching existing products...");
  const { names: existingNames, ids: existingIds } = await fetchExistingProducts(token);
  console.log(`Found ${existingNames.size} existing products.\n`);

  const createdIds = [];
  let skipped = 0;

  for (const product of PRODUCTS_TO_IMPORT) {
    if (existingNames.has(product.folder)) {
      console.log(`SKIP (exists): "${product.folder}"`);
      skipped++;
      continue;
    }

    const folderPath = path.join(PRODUTOS_DIR, product.folder);
    if (!fs.existsSync(folderPath)) {
      console.error(`SKIP: Folder not found: ${folderPath}`);
      continue;
    }

    const files = fs
      .readdirSync(folderPath)
      .filter((f) => /\.jpe?g$/i.test(f))
      .sort();

    if (files.length < 2) {
      console.error(`SKIP: Not enough images in ${product.folder} (${files.length})`);
      continue;
    }

    const firstFile = files[0];
    const hoverFile = files.length >= 26 ? files[25] : firstFile;
    const allButLast = files.slice(0, -1);

    console.log(`Creating "${product.folder}" (${allButLast.length} 360° frames)...`);

    const formData = new FormData();
    formData.append("name_pt", product.folder);
    formData.append("name_en", product.folder);
    formData.append("slug", product.folder.toLowerCase());
    formData.append("description_pt", product.description_pt);
    formData.append("description_en", product.description_en);
    formData.append("enabled", true);
    formData.append("featured", false);
    formData.append("category", product.category);
    formData.append("collection", COLLECTION_ID);

    for (const sId of sizeIds) {
      formData.append("sizes", sId);
    }

    formData.append("media", fileToBlob(path.join(folderPath, firstFile)));
    formData.append("media_hover", fileToBlob(path.join(folderPath, hoverFile)));

    for (const frame of allButLast) {
      formData.append("media_360", fileToBlob(path.join(folderPath, frame)));
    }

    try {
      const record = await createProduct(token, formData);
      createdIds.push(record.id);
      console.log(`  OK -> id=${record.id}`);
    } catch (e) {
      console.error(`  FAILED: ${e.message}`);
    }
  }

  console.log(`\nCreated ${createdIds.length} new products (skipped ${skipped} existing).\n`);

  const allProductIds = [...existingIds, ...createdIds];
  console.log("Updating homepage data...");
  await updateHomepageData(token, allProductIds);
  console.log("");

  console.log("Done!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
