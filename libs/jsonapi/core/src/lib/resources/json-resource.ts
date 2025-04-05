/**
 * Interface representing the JSON:API resource object structure
 * Follows the JSON:API specification for resource objects
 * @see https://jsonapi.org/format/#document-resource-objects
 */
export interface JsonResource {
  /** The resource type identifier */
  type?: string;
  /** The resource unique identifier */
  id?: string;
  /** An object containing the resource's primary data */
  attributes?: Record<string, unknown>;
  /** An object describing relationships between the resource and other resources */
  relationships?: Record<string, { data: JsonResource | JsonResource[] }>;
}
