export interface PopupContent {
  image: string;
  title?: string;
  description?: string;
  cta?: string;
  backgroundColor?: string;
  textColor?: string;
  [key: string]: string | undefined;
}