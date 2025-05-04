export interface Bird {
    id: number;
    scientificName: string;
    commonName: string;
    family: string;
    order?: string;
    genus?: string;
    species?: string;
    conservationStatus: string;
    description: string;
    habitat?: string;
    diet?: string;
    size?: string;
    weight?: number;
    wingspan?: number;
    lifespan?: string;
    breedingSeason?: string;
    imageUrl?: string;
    isVerified: boolean;
    createdAt: Date;
    updatedAt?: Date;
    userId: string;
    observations?: BirdObservation[];
}

export interface BirdObservation {
    id: number;
    birdId: number;
    userId: string;
    location: string;
    date: Date;
    notes?: string;
    imageUrl?: string;
    createdAt: Date;
} 