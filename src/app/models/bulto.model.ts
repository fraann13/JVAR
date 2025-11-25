export interface Bulto {
    name: string;
    dimensions: Dimensiones;
    weight: number;
    maxLoad: number;
    free: boolean;
    
    // Propiedades internas de Parse/Back4app
    objectId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Dimensiones {
    large: number;
    width: number;
    height: number;
}