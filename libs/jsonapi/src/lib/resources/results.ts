import { BaseResource } from './base-resource';
import { Links } from './links';
import { Meta, Pagination } from './meta';

/**
 * Represents a complete JSON:API response containing a collection of resources
 * @template T The resource type, must extend BaseResource
 */
export class Results<T extends BaseResource> {
  public data: T[] = [];
  public included: T[] = [];
  public links: Links = new Links();
  public meta: Meta = new Meta({ pagination: new Pagination() });

  constructor(init?: Partial<Results<T>>) {
    Object.assign(this, init);
  }
}
