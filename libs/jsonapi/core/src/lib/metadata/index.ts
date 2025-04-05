/**
 * Interface describing the metadata for a JSON:API attribute
 * Used for mapping between class properties and JSON:API attributes
 */
export interface AttributeMetadata {
  /** Property name on the TypeScript/JavaScript class */
  property: string;
  /** Runtime type of the property (class constructor or primitive type) */
  type: unknown;
  /** Corresponding attribute name in the JSON:API response */
  attribute: string;
  /** Transform function to convert values between JSON:API and class property formats */
  transform: (value: unknown) => unknown;
}

/**
 * Global registry mapping class constructors to their attribute metadata
 * Used by serializer/deserializer to handle class instances
 */
export const attributeMetadata = new Map<unknown, AttributeMetadata[]>();

/**
 * Global registry mapping class constructors to their JSON:API resource types
 * Used to determine the 'type' field in JSON:API resource objects
 */
export const resourceMetadata = new Map<unknown, string>();
