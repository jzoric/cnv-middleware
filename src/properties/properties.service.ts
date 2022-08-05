import { Injectable } from '@nestjs/common';
import { aql } from 'arangojs';
import { Property } from 'src/model/property';
import { ArangoService } from 'src/persistence/arango/arango.service';

@Injectable()
export class PropertiesService {

    constructor(
        private readonly arangoService: ArangoService) {

    }

    async setProperty<T>(name: string, data: T): Promise<Property<T>> {

        let property: Property<T> = await this.getProperty<T>(name);

        if (!property) {
            property = new Property(name, data);
        } else {
            property.data = data;
        }

        let insert;

        if(property._key) {
            insert = this.updateProperty<T>(property);
        } else {
            insert = this.arangoService.collection.save(property);
        }

        if (insert) {
            return property;
        }
    }

    async updateProperty<T>(property: Property<T>): Promise<Property<T>> {

        const query = aql`
            FOR p in ${this.arangoService.collection}
            FILTER p._key == ${property._key} 
            UPDATE p WITH { modifiedDate: ${new Date()}, data: ${<any>property.data}} IN ${this.arangoService.collection} OPTIONS { exclusive: true }
            RETURN p
            `;
        return this.arangoService.database.query(query)
            .then(res => res.all())
            .then(res => res?.[0]);
    }

    async getProperty<T>(name): Promise<Property<T>> {

        const query = aql`
            FOR p in ${this.arangoService.collection}
            FILTER p.name == ${name}
            RETURN p
            `;

        return this.arangoService.database.query(query)
            .then(res => res.all())
            .then(res => res?.[0]);
    }

}
