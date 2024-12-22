export interface Brand {
  id: string;
  name: string;
  logo: string;
  website: string;
}

export const brands: Brand[] = [
  {
    id: "1",
    name: "Allbirds",
    logo: "/placeholder.svg",
    website: "https://www.allbirds.com"
  },
  {
    id: "2",
    name: "Warby Parker",
    logo: "/placeholder.svg",
    website: "https://www.warbyparker.com"
  },
  {
    id: "3",
    name: "Casper",
    logo: "/placeholder.svg",
    website: "https://www.casper.com"
  }
];