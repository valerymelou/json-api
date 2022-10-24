import { Model } from './model';
import { IJsonApiMetadata, jsonApiMetadataKey } from './json-api-metadata';
import { Resource } from './resource';

export class JsonApi {
  static isPrimitive(obj: unknown): boolean {
    switch (typeof obj) {
      case 'string':
      case 'number':
      case 'boolean':
        return true;
    }

    return !!(obj instanceof String || obj === String ||
      obj instanceof Number || obj === Number ||
      obj instanceof Boolean || obj === Boolean);
  }

  static getClass(target: Model, propertyKey: string): unknown {
    return Reflect.getMetadata('design:type', target, propertyKey);
  }

  static getJsonApiProperty(target: Model, propertyKey: string): IJsonApiMetadata {
    return Reflect.getMetadata(jsonApiMetadataKey, target, propertyKey);
  }

  static deserialize<T extends Model>(cls: {new(): T}, data: Resource, related: Resource[] = []): T {
    const obj = new cls();

    for (const key in obj) {
      const propertyMetadataFunction: (arg0: IJsonApiMetadata) => any = (propertyMetadata) => {
        const propertyName = propertyMetadata.name || key;
        const cls = JsonApi.getClass(obj, key);
        if (cls && !JsonApi.isPrimitive(cls)) {
          // Property is not a primitive
          if (data.relationships && data.relationships[key] && data.relationships[key].data) {
            if (data.relationships[key].data && Array.isArray(data.relationships[key].data) && propertyMetadata.cls) {
              // Property is a list
              const list: T[] = [];
              const included = data.relationships[key].data as Model[];
              included.forEach((item: Model) => {
                const innerData = related.find((relatedData: Model) => relatedData.id == item.id);

                if (innerData) {
                  list.push(JsonApi.deserialize(propertyMetadata.cls, innerData, related));
                }
              });

              return list;
            }

            const innerData = related.find((relatedData: Model) => {
              return relatedData && data.relationships && relatedData.id === (data.relationships[key].data as Model).id ;
            });

            if (innerData) {
              return JsonApi.deserialize(cls as {new(): T}, innerData, related);
            }
          } else if (new (cls as {new(): T})() instanceof Date) {
            const value = data && data.attributes ? data.attributes[propertyName] : undefined;
            if (value && typeof value === 'string') {
              return new Date(value);
            }

            return value;
          }

          return undefined;
        } else {
          return data && data.attributes ? data.attributes[propertyName] : undefined;
        }
      };

      const propertyMetadata:IJsonApiMetadata = JsonApi.getJsonApiProperty(obj, key);
      if (key === 'id') {
        obj[key] = data.id as any;
      } else if (propertyMetadata) {
        obj[key] = propertyMetadataFunction(propertyMetadata);
      } else {
        if (data && data.attributes && data.attributes[key] !== undefined) {
          obj[key] = data.attributes[key] as any;
        }
      }
    }

    return obj;
  }

  static serialize<T extends Model>(cls: {new(): T}, resource: T, resourceType?: string): {data: Resource} {
    const obj = new cls();
    const payload: {data: Resource} = {
      data: {
        attributes: {}
      }
    };

    payload.data.type = resourceType || JsonApi.getResourceType(cls);

    if (resource.id) {
      payload.data.id = resource.id
    }

    for (const key in resource) {
      const propertyMetadata:IJsonApiMetadata = JsonApi.getJsonApiProperty(obj, key);
      let payloadKey: string = key;
      const value: unknown = resource[key];

      if (value === undefined) {
        continue;
      }

      if (propertyMetadata && propertyMetadata.name) {
        payloadKey = propertyMetadata.name;
      }
      if (!this.isPrimitive(value)) {
        const cls = JsonApi.getClass(obj, key);
        if (value && value instanceof Date) {
          payload.data.attributes[payloadKey] = value.toLocaleDateString();
        } else {
          payload.data.attributes[payloadKey] = this.serialize(cls as {new(): T}, value as T).data.attributes;
        }
      } else {
        payload.data.attributes[payloadKey] = value;
      }
    }

    return payload;
  }

  static getResourceType<T>(cls: {new(): T}): string|undefined {
    const types = Reflect.getMetadata('design:paramtypes', cls);

    if (types && types.length > 0) {
      return types[0];
    }

    return undefined;
  }
}
