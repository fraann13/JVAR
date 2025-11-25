import Parse from 'parse';
import { Injectable } from '@angular/core';
import { Contenedor } from '../models/contenedor.model';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ContenedorService {
    constructor() { }

    getContenedores(): Observable<Contenedor[]> {
        return from(this.fetchContenedoresData()).pipe(
            map((parseObjects: Parse.Object[]) => {
                const contenedores: Contenedor[] = parseObjects.map(obj => ({
                    name: obj.get('name'),
                    dimensions: obj.get('dimensions'),
                    maxLoadCapacity: obj.get('maxLoadCapacity'),
                    maxWeight: obj.get('maxWeight'),
                    type: obj.get('type'),

                    // Propiedades internas de Parse/Back4app
                    objectId: obj.id,
                    createdAt: obj.createdAt,
                    updatedAt: obj.updatedAt,
                }));

                return contenedores;
            })
        );
    }

    getContenedorById(objectId: string): Observable<Contenedor> {
        return from(this.fetchContenedorData(objectId)).pipe(
            map((parseObject: Parse.Object) => {
                const contenedor: Contenedor = {
                    name: parseObject.get('name'),
                    dimensions: parseObject.get('dimensions'),
                    maxLoadCapacity: parseObject.get('maxLoadCapacity'),
                    maxWeight: parseObject.get('maxWeight'),
                    type: parseObject.get('type'),

                    // Propiedades internas de Parse/Back4app
                    objectId: parseObject.id,
                    createdAt: parseObject.createdAt,
                    updatedAt: parseObject.updatedAt,
                };
                return contenedor;
            })
        );
    }

    private async fetchContenedorData(objectId: string): Promise<Parse.Object> {
        const ContenedorParse = Parse.Object.extend("Contenedor");
        const query = new Parse.Query(ContenedorParse);

        try {
            const parseObject = await query.get(objectId);
            return parseObject;
        } catch (error) {
            throw new Error(`Contenedor con ID ${objectId} no encontrado en Back4app.`);
        }
    }

    private async fetchContenedoresData(): Promise<Parse.Object[]> {
        const ContenedorParse = Parse.Object.extend("Contenedor");
        const query = new Parse.Query(ContenedorParse);

        try {
            const parseObjects: Parse.Object[] = await query.find();
            return parseObjects;
        } catch (error) {
            throw new Error('No se pudieron cargar los contenedores desde Back4app.');
        }
    }
}