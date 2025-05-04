export interface BirdObservation {
    id: number;
    birdId: number;
    birdCommonName: string;
    birdScientificName: string;
    birdImageUrl?: string;
    latitude: number;
    longitude: number;
    observationDate: Date;
    description?: string;
    numberOfBirds?: number;
    weatherConditions?: string;
    habitat?: string;
    isVerified: boolean;
    createdAt: Date;
    userId: string;
    username: string;
    imageUrls?: string[];
}

export interface CreateBirdObservation {
    birdId: number;
    latitude: number;
    longitude: number;
    observationDate: Date;
    description?: string;
    numberOfBirds?: number;
    weatherConditions?: string;
    habitat?: string;
    images?: File[];
}

export interface UpdateBirdObservation {
    latitude?: number;
    longitude?: number;
    observationDate?: Date;
    description?: string;
    numberOfBirds?: number;
    weatherConditions?: string;
    habitat?: string;
    isVerified?: boolean;
    images?: File[];
} 