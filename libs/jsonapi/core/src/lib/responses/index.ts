import { JsonResource } from '../resources/json-resource';

export interface JsonDetailResponse {
  data: JsonResource;
  included: JsonResource[];
}

export interface JsonListResponse {
  data: JsonResource[];
  included: JsonResource[];
  links: {
    first: string;
    last: string;
    prev: string;
    next: string;
  };
  meta: {
    pagination: {
      count: number;
      page: number;
      pages: number;
    };
  };
}
