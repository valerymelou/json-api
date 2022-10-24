import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { HttpService } from './http/http.service';
import { Model } from './model';
import { JsonApi } from './json-api';
import { Pagination } from './pagination';
import { Results } from './results';
import { Resource } from './resource';

interface JsonApiDetailResponse {
  data: Resource;
  included: Resource[];
}

interface JsonApiListResponse {
  data: Resource[];
  included: Resource[];
  links: {
    first: string;
    last: string;
    prev: string;
    next: string;
  }
  meta: {
    pagination: {
      count: number;
      page: number;
      pages: number;
    }
  }
}

export class JsonApiService<T extends Model> extends HttpService {
  constructor(protected http: HttpClient, protected readonly cls: new () => T , protected readonly url: string) {
    super();
  }

  getList(query?: {[key: string]: string}, url?: string): Observable<Results<T>> {
    let params = new HttpParams();
    if (query) {
      Object.keys(query).forEach((key: string) => {
        const values = query[key].split(',');
        values.forEach((value: string) => {
          if (value.trim()) {
            params = params.append(key, value);
          }
        });
      });
    }

    return this.http.get<JsonApiListResponse>(url || `${this.url}/`, { params }).pipe(
      map((response: JsonApiListResponse) => {
        const results = new Results<T>();
        const pagination = new Pagination();
        pagination.count = response.meta.pagination.count;
        pagination.page = response.meta.pagination.page;
        pagination.pages = response.meta.pagination.pages;
        pagination.first = response.links.first;
        pagination.last = response.links.last;
        pagination.next = response.links.next;
        pagination.previous = response.links.prev;
        results.pagination = pagination;

        response.data.forEach((data: Resource) => {
          results.data.push(this.deserialize(data, response.included));
        });
        return results;
      }),
      catchError(this.handleError)
    );
  }

  getById(id: string): Observable<T> {
    return this.http.get<JsonApiDetailResponse>(`${this.url}/${id}/`).pipe(
      map((response: JsonApiDetailResponse) => this.deserialize(response.data, response.included)),
      catchError(this.handleError)
    );
  }

  create(data: any): Observable<T> {
    return this.http.post<JsonApiDetailResponse>(`${this.url}/`, this.serialize(data)).pipe(
      map((response: JsonApiDetailResponse) => this.deserialize(response.data)),
      catchError(this.handleError)
    );
  }

  update(instance: T): Observable<T> {
    return this.http.patch<JsonApiDetailResponse>(`${this.url}/${instance.id}/`, this.serialize(instance)).pipe(
      map((response: JsonApiDetailResponse) => this.deserialize(response.data)),
      catchError(this.handleError)
    );
  }

  patch(id: string, field: string, value: any): Observable<T> {
    const data = {
      data: {
        type: this.getResourceType(),
        id: id,
        attributes: {}
      }
    } as any;

    data.data.attributes[field] = value;

    return this.http.patch<JsonApiDetailResponse>(`${this.url}/${id}/`, data).pipe(
      map((response: JsonApiDetailResponse) => this.deserialize(response.data, response.included)),
      catchError(this.handleError)
    );
  }

  delete(resource: T): Observable<null> {
    return this.http.delete<null>(`${this.url}/${resource.id}/`).pipe(
      map(() => {
        return null;
      }),
      catchError(this.handleError)
    );
  }

  protected deserialize(data: any, related: Resource[] = []): T {
    return JsonApi.deserialize<T>(this.cls, data, related);
  }

  protected serialize(resource: T): {data: Resource } {
    return JsonApi.serialize<T>(this.cls, resource);
  }

  protected getResourceType(): string|undefined {
    return JsonApi.getResourceType<T>(this.cls);
  }
}
