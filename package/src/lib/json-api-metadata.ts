import 'reflect-metadata';

export const jsonApiMetadataKey = Symbol('jsonApiProperty');

export interface IJsonApiMetadata {
  name?: string;
  cls?: any;
}
