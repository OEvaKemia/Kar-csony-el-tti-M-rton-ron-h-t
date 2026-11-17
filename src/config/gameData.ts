import { LabId, Hint, DiaryEntry } from '../types';

export const LAB_METADATA: Record<LabId, {
  title: string;
  subtitle: string;
  sealName: string;
  sealColor: string;
  glowColor: string;
  code: string;
  fragment: string;
  lore: string;
}> = {
  lab1: {
    title: 'I. Laboratórium',
    subtitle: 'A Színek Laboratóriuma',
    sealName: 'A Színek Pecsétje',
    sealColor: '#06b6d4', // cyan
    glowColor: 'rgba(6, 182, 212, 0.5)',
    code: '2117',
    fragment: 'CUSO',
    lore: 'A szabotőr titkos kódolással lezárta a spektrofotometriás kamrát. Három ismeretlen oldat, három indikátor és a hibás jegyzőkönyv javítása áll rendelkezésedre a sav-bázis egyensúly helyreállításához.',
  },
  lab2: {
    title: 'II. Laboratórium',
    subtitle: 'Az Illatmolekulák Titkos Kamrája',
    sealName: 'Az Illatok Pecsétje',
    sealColor: '#f59e0b', // amber
    glowColor: 'rgba(245, 158, 11, 0.5)',
    code: '2313',
    fragment: 'OREM',
    lore: 'A karácsonyi légkondicionáló aromaszűrőit a szabotőr megrongálta. Csak a négy ünnepi illatmolekula 3D szerkezetének, összegképletének és funkciós csoportjainak pontos felismerésével indítható újra a rendszer.',
  },
  lab3: {
    title: 'III. Laboratórium',
    subtitle: 'A Hamis Arany Rejtélye',
    sealName: 'Az Arany Pecsétje',
    sealColor: '#eab308', // gold
    glowColor: 'rgba(234, 179, 8, 0.5)',
    code: '1931',
    fragment: 'NON',
    lore: 'A szabotőr a kriogén szupravezetők aranylemezeit hamisítványokra cserélte. Az Archimédesz-féle sűrűségmérés és az üregtérfogat kiszámítása az egyetlen mód a tiszta arany igazolására.',
  },
  lab4: {
    title: 'IV. Laboratórium',
    subtitle: 'A Hógolyógyár',
    sealName: 'A Hógolyógyár Pecsétje',
    sealColor: '#38bdf8', // sky blue
    glowColor: 'rgba(56, 189, 248, 0.5)',
    code: '81048',
    fragment: 'RE',
    lore: 'A légköri hókristály-generátor nyomásszelepei elállítódtak. Az izoterm és izochor gázállapotok helyes beállításával elindítható az ünnepi hóesés.',
  },
  lab5: {
    title: 'V. Laboratórium',
    subtitle: 'A Molekulák Titkos Kódja',
    sealName: 'A Szerkezet Pecsétje',
    sealColor: '#a855f7', // purple
    glowColor: 'rgba(168, 85, 247, 0.5)',
    code: '4234',
    fragment: 'LAB',
    lore: 'A szintetikus polimer-reaktorban a szénhidrogének izomervizsgálata szükséges a reaktor zárjának feloldásához. A térbeli elrendeződés és az izoméria adja a végső laboratóriumi pecsétet.',
  },
};

export const LAB_HINTS: Record<LabId, Hint[]> = {
  lab1: [
    {
      tier: 1,
      penalty: 5,
      title: 'Apró nyom',
      text: 'Figyeld meg a kísérletek során: a fenolftalein kizárólag lúgos közegben válik ciklámen-rózsaszínűvé, savas és semleges közegben színtelen marad. A semleges közegben a metilnarancs narancssárga, a lakmusz pedig lila.',
    },
    {
      tier: 2,
      penalty: 10,
      title: 'Kémiai segítség',
      text: 'A kijavított pH-értékek: A = 2,0 (savas), B = 11,0 (lúgos), C = 7,0 (semleges). A jegyzőkönyvben az 1., 3. és 5. bejegyzés hibás, a 2. és 4. pedig helyes!',
    },
    {
      tier: 3,
      penalty: 15,
      title: 'Részletes segítség',
      text: 'A hibás sorok helyes színei: 1. Színtelen, 3. Narancssárga, 5. Lila. Az A → B → C sorrendű pH-értékek egész számjegyeiből összeálló kód: 2117.',
    },
  ],
  lab2: [
    {
      tier: 1,
      penalty: 5,
      title: 'Apró nyom',
      text: 'Számold meg minden 3D modellben a szürke (C), fehér (H) és piros (O) gömböket! Figyeld meg a piros oxigénatomok számát (0, 1, 2 vagy 3) és a hattagú gyűrűben lévő kettős kötések számát.',
    },
    {
      tier: 2,
      penalty: 10,
      title: 'Kémiai segítség',
      text: '1. minta: C₉H₈O (aldehid + C=C kettős kötés). 2. minta: C₈H₈O₃ (aldehid + fenolos -OH + éter). 3. minta: C₁₀H₁₆ (csak C=C kettős kötések, oxigén nélkül). 4. minta: C₁₀H₁₂O₂ (fenolos -OH + éter + C=C kettős kötés).',
    },
    {
      tier: 3,
      penalty: 15,
      title: 'Részletes segítség',
      text: 'Az egyes mintákban felismert eltérő funkciós csoportok száma sorrendben: 1. minta = 2, 2. minta = 3, 3. minta = 1, 4. minta = 3. Így a 4 jegyű feloldókód: 2313.',
    },
  ],
  lab3: [
    {
      tier: 1,
      penalty: 5,
      title: 'Apró nyom',
      text: 'A sűrűség képlete: ρ = m / V. Mérd meg mindhárom érme tömegét és térfogatát (5,0 cm³)! A C érme: 96,5 / 5,0 = 19,3 g/cm³, ami megegyezik a színarany sűrűségével.',
    },
    {
      tier: 2,
      penalty: 10,
      title: 'Kémiai segítség',
      text: 'A B érme tömege 77,2 g. Ha tiszta aranyból van, az arany tényleges térfogata V = m / ρ = 77,2 / 19,3 = 4,0 cm³. A külső térfogat 5,0 cm³, tehát az üreg térfogata: 5,0 - 4,0 = 1,0 cm³.',
    },
    {
      tier: 3,
      penalty: 15,
      title: 'Részletes segítség',
      text: 'A tiszta arany sűrűsége (19,3) és a B érme üregének térfogata (1,0) összevonva adja a kódot: 1931.',
    },
  ],
  lab4: [
    {
      tier: 1,
      penalty: 5,
      title: 'Apró nyom',
      text: '1. feladat: Boyle–Mariotte törvény: p1 · V1 = p2 · V2 (2,0 · 6,0 = 1,5 · V2 -> V2 = 8,0 L). 2. feladat: Izochor: p1 / T1 = p2 / T2 (1,2 / 300 = p2 / 250 -> p2 = 1,0 atm).',
    },
    {
      tier: 2,
      penalty: 10,
      title: 'Kémiai segítség',
      text: '3. feladat: Izoterm pV = 12,0 atm·L. Az A és B érzékelő szorzata pontosan 12. A C érzékelő: 2,5 · 5,0 = 12,5 atm·L, ez a hibás! Helyes V = 12 / 2,5 = 4,8 L.',
    },
    {
      tier: 3,
      penalty: 15,
      title: 'Részletes segítség',
      text: 'A kód: 1. eredmény egész része = 8; 2. eredmény tizedes nélkül (1,0 -> 10); 3. eredmény tizedes nélkül (4,8 -> 48). Kód: 81048.',
    },
  ],
  lab5: [
    {
      tier: 1,
      penalty: 5,
      title: 'Apró nyom',
      text: 'Az A és C modell 4 szénatomos (egyenes láncú n-bután és elágazó 2-metilpropán), a B modell 5 szénatomos (neopentán), míg a D modell 8 szénatomos elágazó lánc (2,2,4-trimetilpentán).',
    },
    {
      tier: 2,
      penalty: 10,
      title: 'Kémiai segítség',
      text: 'A C5H12 legelágazóbb izomerje a 2,2-dimetilpropán (neopentán), ahol egy központi szénatomhoz 4 másik szénatom kapcsolódik (kvaterner szén).',
    },
    {
      tier: 3,
      penalty: 15,
      title: 'Részletes segítség',
      text: 'Számjegyek: Bután C atomszáma = 4. C4H10 izomerek száma = 2. C5H12 izomerek száma = 3. 2,2-dimetilpropán központi C-hez kapcsolódó C-k = 4. Kód: 4234.',
    },
  ],
};

export const FINALE_HINTS: Hint[] = [
  {
    tier: 1,
    penalty: 5,
    title: 'Szótagolás és szóhatárok',
    text: 'Az öt laboratóriumi töredékből pontosan három latin szó áll össze. Két helyen két-két töredéket kell összekapcsolni szóköz nélkül!',
  },
  {
    tier: 2,
    penalty: 10,
    title: 'Kezdőszótagok nyoma',
    text: 'Az első szó egy rövid, 3 betűs latin tagadószó. A második szó a RE- előtaggal kezdődik (összesen 6 betű), a harmadik pedig a LAB- szótaggal indul (összesen 7 betű).',
  },
  {
    tier: 3,
    penalty: 15,
    title: 'Jelentés és fordítás',
    text: 'A magyar értelmezéshez gondolj a tagadás („nem...”) és a munka vagy feladat vállalásának gondolatára (például: „Nem utasítom el a munkát”).',
  },
];

export const DIARY_ENTRIES: DiaryEntry[] = [
  {
    id: 'indicators',
    title: 'Sav-bázis indikátorok és pH',
    category: 'Általános kémia',
    icon: 'FlaskConical',
    summary: 'Az indikátorok olyan gyenge szerves savak vagy bázisok, amelyek színváltozással jelzik az oldat kémhatását.',
    details: [
      'A pH a hidrogénion-koncentráció negatív tízes alapú logaritmusa: pH = -log[H+].',
      'pH < 7: savas kémhatás ([H+] > [OH-]).',
      'pH = 7: semleges kémhatás (tiszta víz 25 °C-on).',
      'pH > 7: lúgos kémhatás ([OH-] > [H+]).',
    ],
    table: {
      headers: ['Indikátor', 'Savas közeg (pH < 7)', 'Semleges közeg (pH = 7)', 'Lúgos közeg (pH > 7)'],
      rows: [
        ['Fenolftalein', 'Színtelen', 'Színtelen', 'Élénk ciklámen / lila'],
        ['Metilnarancs', 'Piros / Vörös', 'Narancssárga', 'Sárga'],
        ['Lakmusz', 'Piros', 'Lila', 'Kék'],
      ],
    },
  },
  {
    id: 'aromas',
    title: 'Szerves funkciós csoportok és aromák',
    category: 'Szerves kémia',
    icon: 'Sparkles',
    summary: 'A szerves vegyületek kémiai viselkedését és illatát a molekulában található jellegzetes atomcsoportok (funkciós csoportok) határozzák meg.',
    details: [
      'A 3D molekulamodellekben a szürke gömb a szén (C), a fehér a hidrogén (H), a piros pedig az oxigén (O).',
      'Aldehidcsoport (-CH=O): szénatomhoz kettős kötéssel kapcsolódó oxigén és egy hidrogénatom a lánc végén.',
      'Fenolos hidroxilcsoport (Ar-OH): aromás (benzol)gyűrűhöz közvetlenül kapcsolódó -OH csoport.',
      'Étercsoport (R-O-R′): két szénatomot összekötő hídszerű oxigénatom (pl. metoxicsoport: -O-CH3).',
      'C=C kettős kötés: két szénatom között látható párhuzamos kettős pálcika (az aromás gyűrűn kívüli oldalláncban vagy ciklohexén gyűrűben).',
    ],
    table: {
      headers: ['Funkciós csoport', 'Jellegzetes szerkezet', 'Atomok a 3D modellben'],
      rows: [
        ['Aldehidcsoport', '-CH=O', '1 C + 1 O (kettős kötés) + 1 H'],
        ['Fenolos hidroxilcsoport', 'Ar-OH', 'Gyűrűs C – O – H'],
        ['Étercsoport', '-O-CH3', 'Gyűrűs C – O – C (metilcsoport)'],
        ['C=C kettős kötés', '>C=C<', 'Két C-atom közötti kettős kötés'],
      ],
    },
  },
  {
    id: 'density',
    title: 'Tömeg, térfogat és sűrűség (Archimédesz)',
    category: 'Fizikai kémia',
    icon: 'Scale',
    summary: 'A sűrűség az anyag egységnyi térfogatának tömege: ρ = m / V.',
    details: [
      'Szilárd testek térfogatát folyadékkiszorításos módszerrel (mérőhengerben) mérhetjük meg.',
      'A színarany (Au) sűrűsége normál állapotban: 19,30 g/cm³.',
      'Ha egy tárgy sűrűsége kisebb, mint az aranyé, de aranyból készült, akkor belül üreges!',
      'Üreg térfogata = Test külső térfogata - Arany tényleges térfogata (m / ρ_arany).',
    ],
    formula: 'ρ = m / V  =>  V_arany = m / 19,3  =>  V_üreg = V_összes - V_arany',
  },
  {
    id: 'gaslaws',
    title: 'Ideális gáztörvények és állapotváltozások',
    category: 'Fizikai kémia',
    icon: 'Wind',
    summary: 'Zárt gázrendszerek viselkedése nyomás (p), térfogat (V) és hőmérséklet (T) változásakor.',
    details: [
      'Boyle–Mariotte-törvény (izoterm állapotváltozás, T = állandó): p1 · V1 = p2 · V2 = állandó (pV = konstans).',
      'Gay-Lussac II. törvénye (izochor állapotváltozás, V = állandó): p1 / T1 = p2 / T2 = állandó.',
      'Abszolút hőmérséklet mértékegysége: Kelvin (K).',
    ],
    formula: 'p1 · V1 = p2 · V2  (T = konstans)  |  p1 / T1 = p2 / T2  (V = konstans)',
  },
  {
    id: 'isomers',
    title: 'Szénhidrogének és szerkezeti izoméria',
    category: 'Szerves kémia',
    icon: 'Boxes',
    summary: 'Azonos összegképletű, de eltérő atomkapcsolódású és szerkezetű vegyületek.',
    details: [
      'Alkánok általános képlete: CnH2n+2.',
      'A C-C egyszeres kötések szabadon elfordulhatnak (konformációk), de ez NEM változtatja meg a konstitúciót (kapcsolódási sorrendet)!',
      'Bután (C4H10) izomerek (2 db): n-bután (CH3-CH2-CH2-CH3) és 2-metilpropán / izobután (CH(CH3)3).',
      'Pentán (C5H12) izomerek (3 db): n-pentán, 2-metilbután (izopentán) és 2,2-dimetilpropán (neopentán).',
      'Kvaterner szénatom: olyan szénatom, amelyhez közvetlenül négy másik szénatom kapcsolódik (pl. 2,2-dimetilpropán központi atomja).',
    ],
  },
];

// Configuration for teacher's Google Form result submission
export const GOOGLE_FORM_CONFIG = {
  // Form action URL (e.g. https://docs.google.com/forms/d/e/.../viewform)
  // Teachers can replace this URL and the field entry IDs with their own Google Form!
  baseUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc-EXAMPLE-FORM-ID/viewform',
  // Field mapping entry IDs:
  entries: {
    teamName: 'entry.1000001',
    members: 'entry.1000002',
    totalScore: 'entry.1000003',
    labScores: 'entry.1000004',
    elapsedTime: 'entry.1000005',
    hintsCount: 'entry.1000006',
    favoriteLab: 'entry.1000007',
  },
};
