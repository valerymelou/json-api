import { resourceMetadata } from '../metadata';

/**
 * Class decorator that defines the JSON:API resource type for a class
 * Used to set the 'type' field in JSON:API resource objects
 *
 * @param type The JSON:API resource type identifier
 * @example
 * @JsonResource('users')
 * class User extends BaseResource {
 *   // ...
 * }
 */
export function JsonResource(type: string) {
  return function (target: unknown) {
    resourceMetadata.set(target, type);
  };
}
