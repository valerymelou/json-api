import { BaseResource } from '../resources/base-resource';
import { JsonResource } from '../resources/json-resource';
import { attributeMetadata, resourceMetadata } from '../metadata';
import { Results } from '../resources/results';
import { Links } from '../resources/links';
import { Meta, Pagination } from '../resources/meta';

// Used for type checking and as a constructor reference
class Base extends BaseResource {}

/**
 * Generic type for class constructors
 * @template T The type of instance the constructor creates
 */
type Constructor<T> = new () => T;

/**
 * Returns true if the given object is of a primitive type.
 * @param obj The object to check if it is of primitive type
 * @returns True if the object is a primitive type (string, number, boolean) or their wrapper objects
 */
function isPrimitive(obj: unknown): boolean {
  // Primitive types are string, number and boolean.
  switch (typeof obj) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'undefined':
      return true;
    default:
      return (
        obj instanceof String ||
        obj === String ||
        obj instanceof Number ||
        obj === Number ||
        obj instanceof Boolean ||
        obj === Boolean
      );
  }
}

/**
 * Deserializes a JSON:API resource object into a class instance
 * Handles both attributes and relationships, including nested resources
 * @template T Type of the class to deserialize into, must extend BaseResource
 * @param cls The constructor of the class to instantiate
 * @param data The JSON:API resource object to deserialize
 * @param related Array of related resources that might be referenced in relationships
 * @returns An instance of T populated with the deserialized data
 */
export function deserialize<T extends BaseResource>(
  cls: Constructor<T>,
  data: JsonResource,
  related: JsonResource[]
): T {
  const resource = new cls();
  const metadata = attributeMetadata.get(resource.constructor);
  resource.id = data.id;
  related = related || [];

  if (!metadata) return resource;

  for (const { attribute, property, type, transform } of metadata) {
    const attributeValue = data.attributes?.[attribute];
    const relationshipData = data.relationships?.[attribute]?.data;

    if (isPrimitive(type)) {
      resource[property as keyof T] = transform(attributeValue) as T[Extract<
        keyof T,
        string
      >];
      continue;
    }

    if (type && new (type as typeof Base)() instanceof Date && attributeValue) {
      resource[property as keyof T] = new Date(
        attributeValue as string
      ) as T[Extract<keyof T, string>];
    }

    if (!relationshipData || !type) continue;

    if (Array.isArray(relationshipData)) {
      const relatedResources = relationshipData
        .map((item: JsonResource) =>
          related.find((r) => r.id === item.id && r.type === item.type)
        )
        .filter(
          (relatedResource): relatedResource is JsonResource =>
            relatedResource !== undefined
        )
        .map((relatedResource) =>
          deserialize(type as typeof Base, relatedResource, related)
        );

      resource[property as keyof T] = relatedResources as T[Extract<
        keyof T,
        string
      >];
      continue;
    }

    const relatedResource = related.find(
      (r) => r.id === relationshipData.id && r.type === relationshipData.type
    );
    if (relatedResource) {
      resource[property as keyof T] = deserialize(
        type as typeof Base,
        relatedResource,
        related
      ) as T[Extract<keyof T, string>];
    }
  }

  return resource;
}

/**
 * Serializes a class instance into a JSON:API resource object
 * Handles both attributes and relationships, following the JSON:API specification
 * @template T Type of the resource to serialize, must extend BaseResource
 * @param cls The constructor of the resource class
 * @param data The instance to serialize
 * @param relationship If true, only includes type and id for relationship objects
 * @returns A JSON:API compliant resource object
 */
export function serialize<T extends BaseResource>(
  cls: Constructor<T>,
  data: unknown,
  relationship = false
): { data: JsonResource } {
  const obj = new cls();
  const resource: Partial<T> = { ...(data as T) };
  const atm = attributeMetadata.get(obj.constructor);
  const arm = resourceMetadata.get(obj.constructor);
  const payload: { data: JsonResource } = {
    data: {
      type: arm,
    },
  };

  if (resource.id) {
    payload.data.id = resource.id;
  }

  if (relationship) return payload;

  payload.data.attributes = {};

  for (const key in data as object) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = (data as Record<string, unknown>)[key];
      const attributeMetadata = atm?.find((m) => m.property === key);

      if (attributeMetadata) {
        const { attribute, type } = attributeMetadata;

        if (isPrimitive(type)) {
          payload.data.attributes[attribute] = value;
          continue;
        }

        if (type === Date) {
          payload.data.attributes[attribute] =
            value instanceof Date
              ? `${value.getFullYear()}-${
                  value.getMonth() + 1
                }-${value.getDate()}`
              : null;
          continue;
        }

        if (Array.isArray(value)) {
          (payload.data.relationships as Record<string, unknown>)[attribute] = {
            data: value.map((item) => {
              return serialize(type as Constructor<BaseResource>, item, true)
                .data;
            }),
          };
          continue;
        }

        if (value instanceof BaseResource && value.id) {
          if (!payload.data.relationships) {
            payload.data.relationships = {};
          }
          payload.data.relationships[key] = serialize(
            type as Constructor<BaseResource>,
            value,
            true
          );
        }
      }
    }
  }

  return payload;
}

/**
 * Deserializes a JSON:API collection response into a Results object
 * Handles data array, included resources, links and meta information
 * @template T Type of the resource to deserialize, must extend BaseResource
 * @param cls The constructor of the resource class
 * @param response The JSON:API collection response
 * @returns A Results instance containing the deserialized collection
 */
export function deserializeCollection<T extends BaseResource>(
  cls: Constructor<T>,
  response: {
    data: JsonResource[];
    included?: JsonResource[];
    links?: {
      first?: string | null;
      last?: string | null;
      next?: string | null;
      prev?: string | null;
    };
    meta?: {
      pagination?: {
        count?: number;
        page?: number;
        pages?: number;
      };
    };
  }
): Results<T> {
  const results = new Results<T>();
  const included = response.included || [];

  // Deserialize main data array
  results.data = response.data.map((item) => deserialize(cls, item, included));

  // Copy pagination links if present
  if (response.links) {
    results.links = new Links({
      first: response.links.first ?? null,
      last: response.links.last ?? null,
      next: response.links.next ?? null,
      prev: response.links.prev ?? null,
    });
  }

  // Copy pagination meta if present
  if (response.meta?.pagination) {
    results.meta = new Meta({
      pagination: new Pagination({
        count: response.meta.pagination.count ?? 0,
        page: response.meta.pagination.page ?? 1,
        pages: response.meta.pagination.pages ?? 0,
      }),
    });
  }

  return results;
}
