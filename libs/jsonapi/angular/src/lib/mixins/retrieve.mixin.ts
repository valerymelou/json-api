import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { BaseResource, deserialize, JsonDetailResponse } from '@vmelou/jsonapi';

export class RetrieveMixin<T extends BaseResource> {
  constructor(
    private http: HttpClient,
    private endpoint: string,
    protected readonly cls: new () => T
  ) {}

  retrieve(id: string, include: string[] = []): Observable<T> {
    let params = new HttpParams();

    if (include.length !== 0) {
      params = params.set('include', include.join(','));
    }

    return this.http
      .get<JsonDetailResponse>(`${this.endpoint}/${id}/`, { params })
      .pipe(
        map((response: JsonDetailResponse) => {
          return deserialize<T>(this.cls, response.data, response.included);
        })
      );
  }
}
