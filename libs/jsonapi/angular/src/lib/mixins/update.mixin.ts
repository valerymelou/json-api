import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  JsonDetailResponse,
  BaseResource,
  deserialize,
  serialize,
} from '@vmelou/jsonapi';

export class UpdateMixin<T extends BaseResource> {
  constructor(
    private http: HttpClient,
    private endpoint: string,
    protected readonly cls: new () => T
  ) {}

  update(id: string, data: Partial<T>): Observable<T> {
    return this.http
      .patch<JsonDetailResponse>(
        `${this.endpoint}/${id}/`,
        serialize(this.cls, { id, ...data })
      )
      .pipe(
        map((response: JsonDetailResponse) => {
          return deserialize(this.cls, response.data, []);
        })
      );
  }
}
