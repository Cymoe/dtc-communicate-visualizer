export interface Brand {
  id: string;
  name: string;
  logo: string;
  website: string;
}

// Note: These are just for development/testing purposes
// In production, we'll fetch from the database
export const brands: Brand[] = [
  {
    id: "d290f1ee-6c54-4b01-90e6-d701748f0851", // example UUID
    name: "Glossier",
    logo: "/placeholder.svg",
    website: "https://www.glossier.com"
  },
  {
    id: "d290f1ee-6c54-4b01-90e6-d701748f0852", // example UUID
    name: "Bombas",
    logo: "/placeholder.svg",
    website: "https://www.bombas.com"
  },
  {
    id: "d290f1ee-6c54-4b01-90e6-d701748f0853", // example UUID
    name: "Away",
    logo: "/placeholder.svg",
    website: "https://www.awaytravel.com"
  },
  {
    id: "d290f1ee-6c54-4b01-90e6-d701748f0854", // example UUID
    name: "Brooklinen",
    logo: "/placeholder.svg",
    website: "https://www.brooklinen.com"
  },
  {
    id: "d290f1ee-6c54-4b01-90e6-d701748f0855", // example UUID
    name: "Outdoor Voices",
    logo: "/placeholder.svg",
    website: "https://www.outdoorvoices.com"
  }
];