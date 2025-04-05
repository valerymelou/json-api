import { snakeToCamel } from '../utils/text';

/**
 * Interface representing a JSON:API error object
 * @see https://jsonapi.org/format/#error-objects
 */
export interface Error {
  /** Application-specific error code */
  code: string;
  /** Human-readable explanation of the error */
  detail: string;
  /** The HTTP status code applicable to this problem */
  status: string;
  /** Object containing references to the source of the error */
  source?: { pointer: string };
}

/**
 * Class for handling JSON:API error responses
 * Provides functionality to parse and transform JSON:API error objects
 */
export class ApiError {
  constructor(
    /** Application-specific error code */
    public code: string,
    /** Human-readable explanation of the error */
    public detail?: string,
    /** The HTTP status code applicable to this problem */
    public status?: string,
    /** JSON pointer to the source of the error in the request document */
    public source?: string
  ) {}

  /**
   * Creates an array of ApiError instances from JSON:API error objects
   * Transforms source pointers into camelCase property paths
   * @param errors Array of JSON:API error objects
   * @returns Array of ApiError instances
   */
  static fromErrors(errors: Error[]): ApiError[] {
    const httpErrors: ApiError[] = [];
    errors.forEach((error) => {
      const httpError = new ApiError(error.code, error.detail, error.status);

      if (error?.source?.pointer) {
        let cleanedSource = error.source.pointer.replace(
          /\/data\/attributes\//,
          ''
        );
        cleanedSource = cleanedSource.replace(/\/data/, '');
        cleanedSource = cleanedSource.replace(/\//g, '.');
        httpError.source = snakeToCamel(cleanedSource);
      }

      httpErrors.push(httpError);
    });

    return httpErrors;
  }
}
