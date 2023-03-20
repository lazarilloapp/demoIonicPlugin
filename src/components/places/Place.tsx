import { InnerFloor } from "./InnerFloor";


export interface Place {
  id: string;
  lat: number;
  lng: number;
  inFloor?: string[];
  alias? : string;
  title: {
    default : string;
    es?: string;
    en?: string;
  };
  address?: string;
  externalId?: string;
  innerFloors?: {[key: string]: InnerFloor};
  hasBeacons?: boolean;

}
