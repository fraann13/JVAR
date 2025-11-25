export interface Pallet {
    name: string;
    dimensions: Dimensiones;
    weight: number;
    maxLoad: number;
    
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