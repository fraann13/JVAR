import Parse from 'parse';
import { Injectable } from '@angular/core';
import { Bulto } from '../models/bulto.model';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class BultoService {
    constructor() { }

    getBultos(): Observable<Bulto[]> {
        return from(this.fetchBultosData()).pipe(
            map((parseObjects: Parse.Object[]) => {
                const pallets: Bulto[] = parseObjects.map(obj => ({
                    name: obj.get('name'),
                    dimensions: obj.get('dimensions'),
                    weight: obj.get('weight'),
                    maxLoad: obj.get('maxLoad'),
                    free: obj.get('free'),

                    // Propiedades internas de Parse/Back4app
                    objectId: obj.id,
                    createdAt: obj.createdAt,
                    updatedAt: obj.updatedAt,
                }));

                return pallets;
            })
        );
    }

    getBultoById(objectId: string): Observable<Bulto> {
        return from(this.fetchBultoData(objectId)).pipe(
            map((parseObject: Parse.Object) => {
                const bulto: Bulto = {
                    name: parseObject.get('name'),
                    dimensions: parseObject.get('dimensions'),
                    weight: parseObject.get('weight'),
                    maxLoad: parseObject.get('maxLoad'),
                    free: parseObject.get('free'),

                    // Propiedades internas de Parse/Back4app
                    objectId: parseObject.id,
                    createdAt: parseObject.createdAt,
                    updatedAt: parseObject.updatedAt,
                };
                return bulto;
            })
        );
    }

    private async fetchBultoData(objectId: string): Promise<Parse.Object> {
        const BultoParse = Parse.Object.extend("Bulto");
        const query = new Parse.Query(BultoParse);

        try {
            const parseObject = await query.get(objectId);
            return parseObject;
        } catch (error) {
            throw new Error(`Bulto con ID ${objectId} no encontrado en Back4app.`);
        }
    }

    private async fetchBultosData(): Promise<Parse.Object[]> {
        const BultoParse = Parse.Object.extend("Bulto");
        const query = new Parse.Query(BultoParse);

        try {
            const parseObjects: Parse.Object[] = await query.find();
            return parseObjects;
        } catch (error) {
            throw new Error('No se pudieron cargar los bultos desde Back4app.');
        }
    }
}