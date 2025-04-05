import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import {
  BaseResource,
  deserializeCollection,
  JsonListResponse,
  Results,
} from '@vmelou/jsonapi';

function createHttpParams(query?: { [key: string]: string }): HttpParams {
  let params = new HttpParams();
  if (query !== undefined) {
    Object.keys(query).forEach((key: string) => {
      if (key === 'include') {
        params = params.append(key, query[key]);
        return;
      }

      const values = query[key].split(',');
      values.forEach((value: string) => {
        if (value.trim()) {
          params = params.append(key, value);
        }
      });
    });
  }
  return params;
}

export class ListMixin<T extends BaseResource> {
  constructor(
    private http: HttpClient,
    private endpoint: string,
    protected readonly cls: new () => T
  ) {}

  list(
    query?: { [key: string]: string },
    url?: string
  ): Observable<Results<T>> {
    const params = createHttpParams(query);

    return this.http
      .get<JsonListResponse>(url ?? `${this.endpoint}/`, { params })
      .pipe(
        map((response: JsonListResponse) => {
          return deserializeCollection(this.cls, response);
        })
      );
  }
}
