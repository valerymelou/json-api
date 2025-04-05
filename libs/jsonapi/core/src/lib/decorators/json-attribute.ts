import { AttributeMetadata, attributeMetadata } from '../metadata';
import { BaseResource } from '../resources/base-resource';

/**
 * Property decorator that marks a class property as a JSON:API attribute
 * Used to define how class properties map to JSON:API attributes
 *
 * @param type Optional type of the property (constructor function for classes, or primitive type)
 * @param attribute Optional name of the attribute in JSON:API (defaults to property name)
 * @param transform Optional function to transform values during serialization/deserialization
 * @example
 * class User extends BaseResource {
 *   @JsonAttribute()
 *   name: string;
 *
 *   @JsonAttribute(Date, 'created-at')
 *   createdAt: Date;
 * }
 */
export function JsonAttribute(
  type?: unknown,
  attribute?: string,
  transform?: (value: unknown) => unknown
) {
  return function (target: BaseResource, property: string) {
    if (!attributeMetadata.has(target.constructor)) {
      attributeMetadata.set(target.constructor, []);
    }

    const metadata: AttributeMetadata = {
      attribute: attribute || property,
      property,
      type,
      transform: transform || ((value) => value),
    };

    attributeMetadata.get(target.constructor)?.push(metadata);
  };
}
