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
