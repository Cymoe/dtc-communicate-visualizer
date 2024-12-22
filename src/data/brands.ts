export interface Brand {
  id: string;
  name: string;
  logo: string;
  website: string;
  smsExamples: string[];
  emailExamples: string[];
  popupExample: string;
}

export const brands: Brand[] = [
  {
    id: "1",
    name: "Allbirds",
    logo: "/placeholder.svg",
    website: "https://www.allbirds.com",
    smsExamples: ["/placeholder.svg"],
    emailExamples: ["/placeholder.svg"],
    popupExample: "/placeholder.svg"
  },
  {
    id: "2",
    name: "Warby Parker",
    logo: "/placeholder.svg",
    website: "https://www.warbyparker.com",
    smsExamples: ["/placeholder.svg"],
    emailExamples: ["/placeholder.svg"],
    popupExample: "/placeholder.svg"
  },
  {
    id: "3",
    name: "Casper",
    logo: "/placeholder.svg",
    website: "https://www.casper.com",
    smsExamples: ["/placeholder.svg"],
    emailExamples: ["/placeholder.svg"],
    popupExample: "/placeholder.svg"
  }
];