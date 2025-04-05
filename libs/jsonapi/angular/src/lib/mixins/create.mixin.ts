import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import {
  BaseResource,
  deserialize,
  JsonDetailResponse,
  serialize,
} from '@vmelou/jsonapi';

import { BaseMixin } from './base.mixin';

export class CreateMixin<T extends BaseResource> extends BaseMixin {
  constructor(
    private http: HttpClient,
    private endpoint: string,
    protected readonly cls: new () => T
  ) {
    super();
  }

  create(data: Partial<T>): Observable<T> {
    return this.http
      .post<JsonDetailResponse>(`${this.endpoint}/`, serialize(this.cls, data))
      .pipe(
        map((response: JsonDetailResponse) => {
          return deserialize<T>(this.cls, response.data, response.included);
        }),
        catchError(this.handleErrors)
      );
  }
}
