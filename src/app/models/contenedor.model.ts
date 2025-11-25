export interface Contenedor {
    name: string;
    dimensions: Dimensiones;
    maxLoadCapacity: number;
    maxWeight: number;
    type: number;
    
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