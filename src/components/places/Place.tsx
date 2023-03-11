export interface Place {
  id: string;
  _name: string;
  lat: number;
  lng: number;
  inFloor: string[];
  title: {
    default : string;
    es: string;
    en: string | null;
  } | null;

}
