import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { BaseResource } from '@vmelou/jsonapi';

import { BaseMixin } from './base.mixin';

export class DeleteMixin<T extends BaseResource> extends BaseMixin {
  constructor(
    private http: HttpClient,
    private endpoint: string,
    protected readonly cls: new () => T
  ) {
    super();
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.endpoint}/${id}/`)
      .pipe(catchError(this.handleErrors));
  }
}
