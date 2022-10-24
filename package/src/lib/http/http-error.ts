import { snakeToCamel } from './helpers/text';

export interface Error {
  code: string;
  detail: string;
  status: string;
  source?: {pointer: string};
}

export class HttpError {

  constructor(public code: string, public detail?: string, public status?: string, public source?: string) {}

  static fromErrors(errors: Error[]): HttpError[] {
    const httpErrors: HttpError[] = [];
    errors.forEach(error => {
      const httpError = new HttpError(error.code, error.detail, error.status);

      if (error.source && error.source.pointer) {
        let cleanedSource = error.source.pointer.replace('/data/attributes/', '');
        cleanedSource = cleanedSource.replace(new RegExp('/data'), '');
        cleanedSource = cleanedSource.replace(new RegExp("/"), '.');
        httpError.source = snakeToCamel(cleanedSource);
      }

      httpErrors.push(httpError);
    });

    return httpErrors;
  }
}
