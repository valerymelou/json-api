/**
 * Contains pagination information for a collection of resources
 */
export class Pagination {
  public count = 0;
  public page = 1;
  public pages = 0;

  constructor(init?: Partial<Pagination>) {
    Object.assign(this, init);
  }
}

/**
 * Represents the meta information in a JSON:API response
 * Currently contains pagination information
 */
export class Meta {
  public pagination: Pagination = new Pagination();

  constructor(init?: Partial<Meta>) {
    Object.assign(this, init);
  }
}
