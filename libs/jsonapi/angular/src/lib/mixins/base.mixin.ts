import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ApiError } from '@vmelou/jsonapi';

export class BaseMixin {
  protected handleErrors(
    error: HttpErrorResponse
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Observable<ApiError[] | any> {
    let errors: ApiError[] = [];

    if (
      error.error instanceof ProgressEvent ||
      error.error instanceof ErrorEvent ||
      error.error instanceof TypeError
    ) {
      // A client-side or network error occurred. Handle it accordingly.
      const httpError = new ApiError('', error.message, '0');
      errors.push(httpError);
    } else if (error?.error?.errors) {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      errors = ApiError.fromErrors(error.error.errors);
    }

    return throwError(() => errors);
  }
}
