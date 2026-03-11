// Each country has exactly 2 clue frames: a photo and a fact/text card.
// Frame 3 is always the interactive map — generated dynamically, not stored here.
// Photos: fetched live from Unsplash API; fallback URLs used if API unavailable.

export const COUNTRIES = [
  {
    id: "japan",
    answer: "Japan",
    emoji: "🇯🇵",
    capital: "Tokyo",
    region: "Eastern Asia",
    population: 125700000,
    mapCenter: [36.2048, 138.2529],
    photoQuery: "Japan temple cherry blossom street",
    clues: [
      {
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&q=80",
        attribution: "Photo by Alain Bonnardeaux on Unsplash",
      },
      {
        type: "fact",
        icon: "🍜",
        text: "Famous for ramen, sushi, and cherry blossoms. Home to one of the world's oldest continuous monarchies and the highest life expectancy on Earth.",
      },
    ],
  },
  {
    id: "brazil",
    answer: "Brazil",
    emoji: "🇧🇷",
    capital: "Brasília",
    region: "South America",
    population: 215000000,
    mapCenter: [-14.235, -51.9253],
    photoQuery: "Brazil colorful streets architecture",
    clues: [
      {
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80",
        attribution: "Photo by Agustín Diaz on Unsplash",
      },
      {
        type: "fact",
        icon: "🎭",
        text: "Hosts the world's largest carnival and contains over 60% of the Amazon rainforest. The largest country in South America, speaking Portuguese.",
      },
    ],
  },
  {
    id: "egypt",
    answer: "Egypt",
    emoji: "🇪🇬",
    capital: "Cairo",
    region: "Northern Africa",
    population: 104000000,
    mapCenter: [26.8206, 30.8025],
    photoQuery: "Egypt pyramids sunset photography",
    clues: [
      {
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800&q=80",
        attribution: "Photo by Spencer Davis on Unsplash",
      },
      {
        type: "fact",
        icon: "🏛️",
        text: "Home to the last surviving wonder of the ancient world. The Nile — the world's longest river — flows through it from south to north.",
      },
    ],
  },
  {
    id: "norway",
    answer: "Norway",
    emoji: "🇳🇴",
    capital: "Oslo",
    region: "Northern Europe",
    population: 5400000,
    mapCenter: [60.472, 8.4689],
    photoQuery: "Norway fjord village scenic",
    clues: [
      {
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80",
        attribution: "Photo by Sebastian Müller on Unsplash",
      },
      {
        type: "fact",
        icon: "🐟",
        text: "A land of fjords, Northern Lights, and Vikings. Consistently ranked among the world's happiest and wealthiest countries per capita.",
      },
    ],
  },
  {
    id: "india",
    answer: "India",
    emoji: "🇮🇳",
    capital: "New Delhi",
    region: "Southern Asia",
    population: 1400000000,
    mapCenter: [20.5937, 78.9629],
    photoQuery: "India colorful market street life",
    clues: [
      {
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
        attribution: "Photo by Hardik Sharma on Unsplash",
      },
      {
        type: "fact",
        icon: "🎨",
        text: "Birthplace of yoga, Buddhism, and chess. With 1.4 billion people it's the world's most populous democracy, speaking over 1,600 languages.",
      },
    ],
  },
  {
    id: "australia",
    answer: "Australia",
    emoji: "🇦🇺",
    capital: "Canberra",
    region: "Oceania",
    population: 26000000,
    mapCenter: [-25.2744, 133.7751],
    photoQuery: "Australia Sydney opera house harbour",
    clues: [
      {
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
        attribution: "Photo by Photoholgic on Unsplash",
      },
      {
        type: "fact",
        icon: "🦘",
        text: "The only country that is also an entire continent. Home to kangaroos, koalas, the Great Barrier Reef, and more venomous species than anywhere else.",
      },
    ],
  },
  {
    id: "mexico",
    answer: "Mexico",
    emoji: "🇲🇽",
    capital: "Mexico City",
    region: "Central America",
    population: 130000000,
    mapCenter: [23.6345, -102.5528],
    photoQuery: "Mexico colorful buildings street",
    clues: [
      {
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80",
        attribution: "Photo by Jorge Aguilar on Unsplash",
      },
      {
        type: "fact",
        icon: "🌮",
        text: "Gave the world chocolate, corn, and tomatoes. Home to ancient Aztec and Maya civilizations. Shares a 3,145 km border with the USA.",
      },
    ],
  },
  {
    id: "iceland",
    answer: "Iceland",
    emoji: "🇮🇸",
    capital: "Reykjavík",
    region: "Northern Europe",
    population: 370000,
    mapCenter: [64.9631, -19.0208],
    photoQuery: "Iceland waterfall nature scenic",
    clues: [
      {
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1474690870753-1b92efa1f2d8?w=800&q=80",
        attribution: "Photo by Jon Flobrant on Unsplash",
      },
      {
        type: "fact",
        icon: "🌋",
        text: "An island of fire and ice with more volcanoes and geysers per km² than almost anywhere. Despite the name, it's largely green — Greenland got the marketing.",
      },
    ],
  },
  {
    id: "peru",
    answer: "Peru",
    emoji: "🇵🇪",
    capital: "Lima",
    region: "South America",
    population: 33000000,
    mapCenter: [-9.19, -75.0152],
    photoQuery: "Peru Machu Picchu ruins mountains",
    clues: [
      {
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80",
        attribution: "Photo by Willian Justen de Vasconcellos on Unsplash",
      },
      {
        type: "fact",
        icon: "🦙",
        text: "Home to Machu Picchu and the heart of the Inca Empire. The Amazon River originates here, and it has llamas and alpacas roaming the Andes.",
      },
    ],
  },
  {
    id: "morocco",
    answer: "Morocco",
    emoji: "🇲🇦",
    capital: "Rabat",
    region: "Northern Africa",
    population: 37000000,
    mapCenter: [31.7917, -7.0926],
    photoQuery: "Morocco medina colorful streets",
    clues: [
      {
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1489493585363-d69421e0edd3?w=800&q=80",
        attribution: "Photo by Dario Veronesi on Unsplash",
      },
      {
        type: "fact",
        icon: "🕌",
        text: "A crossroads of Africa and Europe, with vibrant souks and ancient medinas. It contains both the Sahara Desert and peaks of the Atlas Mountains.",
      },
    ],
  },
  {
    id: "thailand",
    answer: "Thailand",
    emoji: "🇹🇭",
    capital: "Bangkok",
    region: "Southeast Asia",
    population: 71600000,
    mapCenter: [15.87, 100.99],
    photoQuery: "Thailand temple Buddhist golden street",
    clues: [
      {
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80",
        attribution: "Photo on Unsplash",
      },
      {
        type: "fact",
        icon: "🐘",
        text: "The only Southeast Asian country never colonised by a European power. Home to over 40,000 Buddhist temples and the world's most revered royal family.",
      },
    ],
  },
  {
    id: "turkey",
    answer: "Turkey",
    emoji: "🇹🇷",
    capital: "Ankara",
    region: "Western Asia",
    population: 85000000,
    mapCenter: [38.96, 35.24],
    photoQuery: "Turkey Cappadocia Istanbul mosque architecture",
    clues: [
      {
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80",
        attribution: "Photo on Unsplash",
      },
      {
        type: "fact",
        icon: "🌙",
        text: "Straddles two continents — Europe and Asia. Istanbul is the only metropolis in the world built across two continents, and Cappadocia's fairy chimneys are unlike anywhere on Earth.",
      },
    ],
  },
  {
    id: "greece",
    answer: "Greece",
    emoji: "🇬🇷",
    capital: "Athens",
    region: "Southern Europe",
    population: 10720000,
    mapCenter: [39.07, 21.82],
    photoQuery: "Greece Santorini blue white island",
    clues: [
      {
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80",
        attribution: "Photo on Unsplash",
      },
      {
        type: "fact",
        icon: "🏛️",
        text: "Birthplace of democracy, the Olympics, and Western philosophy. Has more archaeological museums than any other country, and over 6,000 islands — about 227 inhabited.",
      },
    ],
  },
  {
    id: "kenya",
    answer: "Kenya",
    emoji: "🇰🇪",
    capital: "Nairobi",
    region: "Eastern Africa",
    population: 54000000,
    mapCenter: [0.02, 37.91],
    photoQuery: "Kenya safari savanna wildlife Maasai Mara",
    clues: [
      {
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&q=80",
        attribution: "Photo on Unsplash",
      },
      {
        type: "fact",
        icon: "🦁",
        text: "Home to the Great Rift Valley and the Maasai Mara, where 1.5 million wildebeest migrate every year. Nairobi is the only capital city with a national park inside its boundaries.",
      },
    ],
  },
  {
    id: "vietnam",
    answer: "Vietnam",
    emoji: "🇻🇳",
    capital: "Hanoi",
    region: "Southeast Asia",
    population: 98000000,
    mapCenter: [14.06, 108.28],
    photoQuery: "Vietnam Ha Long Bay rice terraces lantern street",
    clues: [
      {
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1526649661456-89c7ed4d00b8?w=800&q=80",
        attribution: "Photo on Unsplash",
      },
      {
        type: "fact",
        icon: "🍜",
        text: "An S-shaped country stretching 1,650 km from north to south. Ha Long Bay has 1,600 limestone islands, and Hội An's ancient town glows with thousands of silk lanterns every full moon.",
      },
    ],
  },
  {
    id: "spain",
    answer: "Spain",
    emoji: "🇪🇸",
    capital: "Madrid",
    region: "Southern Europe",
    population: 47400000,
    mapCenter: [40.46, -3.75],
    photoQuery: "Spain Barcelona Seville architecture flamenco street",
    clues: [
      {
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1543785734-4b6e564642f8?w=800&q=80",
        attribution: "Photo on Unsplash",
      },
      {
        type: "fact",
        icon: "💃",
        text: "Second-largest country in the EU by area, with 47 UNESCO World Heritage Sites. Home to flamenco, Gaudí's surreal architecture, and more Michelin-starred restaurants than almost anywhere.",
      },
    ],
  },
  {
    id: "colombia",
    answer: "Colombia",
    emoji: "🇨🇴",
    capital: "Bogotá",
    region: "South America",
    population: 51000000,
    mapCenter: [4.57, -74.30],
    photoQuery: "Colombia Cartagena colorful colonial street flowers",
    clues: [
      {
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=800&q=80",
        attribution: "Photo on Unsplash",
      },
      {
        type: "fact",
        icon: "☕",
        text: "The only country in South America with coastlines on both the Pacific and the Atlantic. Produces 15% of the world's coffee and has more species of birds than any other country on Earth.",
      },
    ],
  },
  {
    id: "newzealand",
    answer: "New Zealand",
    emoji: "🇳🇿",
    capital: "Wellington",
    region: "Oceania",
    population: 5100000,
    mapCenter: [-40.90, 174.89],
    photoQuery: "New Zealand fjord mountains landscape Milford Sound",
    clues: [
      {
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
        attribution: "Photo on Unsplash",
      },
      {
        type: "fact",
        icon: "🥝",
        text: "One of the last places on Earth settled by humans — Māori arrived only around 1300 AD. Has more sheep than people (5:1 ratio) and was the first country to grant women the right to vote, in 1893.",
      },
    ],
  },
  {
    id: "southafrica",
    answer: "South Africa",
    emoji: "🇿🇦",
    capital: "Pretoria",
    region: "Southern Africa",
    population: 60000000,
    mapCenter: [-30.56, 22.94],
    photoQuery: "South Africa Cape Town Table Mountain vineyard",
    clues: [
      {
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80",
        attribution: "Photo on Unsplash",
      },
      {
        type: "fact",
        icon: "🦏",
        text: "The only country with three capital cities — Pretoria (executive), Cape Town (legislative), and Bloemfontein (judicial). Has 11 official languages and the world's largest known diamond was found here.",
      },
    ],
  },
  {
    id: "france",
    answer: "France",
    emoji: "🇫🇷",
    capital: "Paris",
    region: "Western Europe",
    population: 68000000,
    mapCenter: [46.23, 2.21],
    photoQuery: "France Paris Eiffel lavender Provence village",
    clues: [
      {
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80",
        attribution: "Photo on Unsplash",
      },
      {
        type: "fact",
        icon: "🥐",
        text: "The most visited country in the world, with over 90 million tourists per year. Has more UNESCO World Heritage Sites than any country except China, and its language was the global diplomatic lingua franca for 300 years.",
      },
    ],
  },
  {
    id: "china",
    answer: "China",
    emoji: "🇨🇳",
    capital: "Beijing",
    region: "Eastern Asia",
    population: 1412000000,
    mapCenter: [35.86, 104.20],
    photoQuery: "China Great Wall misty mountains rice terraces temple",
    clues: [
      {
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80",
        attribution: "Photo on Unsplash",
      },
      {
        type: "fact",
        icon: "🐉",
        text: "The world's most populous country, with a civilisation stretching back over 5,000 years. Invented paper, printing, gunpowder, and the compass — four inventions that transformed the world.",
      },
    ],
  },
  {
    id: "nepal",
    answer: "Nepal",
    emoji: "🇳🇵",
    capital: "Kathmandu",
    region: "Southern Asia",
    population: 29190000,
    mapCenter: [28.39, 84.12],
    photoQuery: "Nepal Himalaya mountains Kathmandu temple Everest",
    clues: [
      {
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
        attribution: "Photo on Unsplash",
      },
      {
        type: "fact",
        icon: "🏔️",
        text: "Home to eight of the world's ten tallest mountains, including Everest. The only country with a non-rectangular national flag — it's a double pennant and represents the Himalayas.",
      },
    ],
  },
  {
    id: "indonesia",
    answer: "Indonesia",
    emoji: "🇮🇩",
    capital: "Jakarta",
    region: "Southeast Asia",
    population: 277000000,
    mapCenter: [-0.79, 113.92],
    photoQuery: "Bali Indonesia temple rice terrace volcano",
    clues: [
      {
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
        attribution: "Photo on Unsplash",
      },
      {
        type: "fact",
        icon: "🌋",
        text: "The world's largest archipelago nation — 17,500 islands stretching wider than the continental USA. Has the fourth largest population on Earth and more active volcanoes than any other country.",
      },
    ],
  },
  {
    id: "tanzania",
    answer: "Tanzania",
    emoji: "🇹🇿",
    capital: "Dodoma",
    region: "Eastern Africa",
    population: 63000000,
    mapCenter: [-6.37, 34.89],
    photoQuery: "Tanzania Serengeti Kilimanjaro wildlife safari",
    clues: [
      {
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80",
        attribution: "Photo on Unsplash",
      },
      {
        type: "fact",
        icon: "🦒",
        text: "Home to Africa's highest peak (Kilimanjaro), largest lake (Victoria), and the Serengeti — where the greatest wildlife spectacle on Earth unfolds every year. The island of Zanzibar was once the world's leading clove producer.",
      },
    ],
  },
  {
    id: "portugal",
    answer: "Portugal",
    emoji: "🇵🇹",
    capital: "Lisbon",
    region: "Southern Europe",
    population: 10300000,
    mapCenter: [39.40, -8.22],
    photoQuery: "Portugal Lisbon tram azulejo tiles Sintra Algarve",
    clues: [
      {
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80",
        attribution: "Photo on Unsplash",
      },
      {
        type: "fact",
        icon: "⛵",
        text: "Once the world's greatest seafaring empire, reaching Brazil, Africa, India, and Japan in the 15th–16th centuries. Lisbon is Europe's westernmost capital and the oldest in Western Europe.",
      },
    ],
  },
];

export function getDailyCountry() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / 86400000
  );
  return COUNTRIES[dayOfYear % COUNTRIES.length];
}

// Shuffle bag: cycles through ALL countries before repeating any.
let _bag = [];

function _refillBag(excludeId) {
  _bag = COUNTRIES.filter((c) => c.id !== excludeId)
    .map((c) => ({ c, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map(({ c }) => c);
}

export function getRandomCountry(excludeId = null) {
  // Remove the excluded country from remaining bag too
  _bag = _bag.filter((c) => c.id !== excludeId);
  if (_bag.length === 0) _refillBag(excludeId);
  return _bag.pop();
}
