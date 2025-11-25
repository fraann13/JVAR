import Parse from 'parse';
import { Injectable } from '@angular/core';
import { Pallet } from '../models/pallet.model';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class PalletService {
    constructor() { }

    getPallets(): Observable<Pallet[]> {
        return from(this.fetchPalletsData()).pipe(
            map((parseObjects: Parse.Object[]) => {
                const pallets: Pallet[] = parseObjects.map(obj => ({
                    name: obj.get('name'),
                    dimensions: obj.get('dimensions'),
                    weight: obj.get('weight'),
                    maxLoad: obj.get('maxLoad'),

                    // Propiedades internas de Parse/Back4app
                    objectId: obj.id,
                    createdAt: obj.createdAt,
                    updatedAt: obj.updatedAt,
                }));

                return pallets;
            })
        );
    }

    getPalletById(objectId: string): Observable<Pallet> {
        return from(this.fetchPalletData(objectId)).pipe(
            map((parseObject: Parse.Object) => {
                const pallet: Pallet = {
                    name: parseObject.get('name'),
                    dimensions: parseObject.get('dimensions'),
                    weight: parseObject.get('weight'),
                    maxLoad: parseObject.get('maxLoad'),

                    // Propiedades internas de Parse/Back4app
                    objectId: parseObject.id,
                    createdAt: parseObject.createdAt,
                    updatedAt: parseObject.updatedAt,
                };
                return pallet;
            })
        );
    }

    private async fetchPalletData(objectId: string): Promise<Parse.Object> {
        const PalletParse = Parse.Object.extend("Pallet");
        const query = new Parse.Query(PalletParse);

        try {
            const parseObject = await query.get(objectId);
            return parseObject;
        } catch (error) {
            throw new Error(`Pallet con ID ${objectId} no encontrado en Back4app.`);
        }
    }

    private async fetchPalletsData(): Promise<Parse.Object[]> {
        const PalletParse = Parse.Object.extend("Pallet");
        const query = new Parse.Query(PalletParse);

        try {
            const parseObjects: Parse.Object[] = await query.find();
            return parseObjects;
        } catch (error) {
            throw new Error('No se pudieron cargar los pallets desde Back4app.');
        }
    }
}