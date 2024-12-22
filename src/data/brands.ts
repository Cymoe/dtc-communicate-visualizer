export interface Brand {
  id: string;
  name: string;
  logo: string;
  website: string;
}

export const brands: Brand[] = [
  {
    id: "1",
    name: "Glossier",
    logo: "/placeholder.svg",
    website: "https://www.glossier.com"
  },
  {
    id: "2",
    name: "Bombas",
    logo: "/placeholder.svg",
    website: "https://www.bombas.com"
  },
  {
    id: "3",
    name: "Away",
    logo: "/placeholder.svg",
    website: "https://www.awaytravel.com"
  },
  {
    id: "4",
    name: "Brooklinen",
    logo: "/placeholder.svg",
    website: "https://www.brooklinen.com"
  },
  {
    id: "5",
    name: "Outdoor Voices",
    logo: "/placeholder.svg",
    website: "https://www.outdoorvoices.com"
  }
];