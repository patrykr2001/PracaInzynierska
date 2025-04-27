export interface Bird {
    id: number;
    scientificName: string;
    commonName: string;
    family?: string;
    order?: string;
    conservationStatus?: string;
    description?: string;
    imageUrl?: string;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
} 