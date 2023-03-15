export interface InnerFloor {
    index: number;
    key: string;
    name: {
        default : string;
        es: string;
        en?: string;
    };
    floor: string;
    level: number;
    title: string;
    vectorTile: boolean;
}
