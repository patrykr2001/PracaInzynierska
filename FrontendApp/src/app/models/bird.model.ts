export interface Bird {
    id: number;
    scientificName: string;
    commonName: string;
    family?: string;
    order?: string;
    conservationStatus?: string;
    description?: string;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
} 