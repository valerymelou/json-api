import { jsonApiMetadataKey } from "./json-api-metadata";

export function JsonApiProperty(metadata: string, cls?: any): any {
  return Reflect.metadata(jsonApiMetadataKey, {name: metadata, cls});
}

export function JsonApiResource(...types: string[]): any {
  return Reflect.metadata("design:paramtypes", types);
}
