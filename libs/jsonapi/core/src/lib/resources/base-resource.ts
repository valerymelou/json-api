/**
 * Base class for JSON:API resources that provides common functionality
 * All resource classes should extend this class
 */
export class BaseResource {
  public id?: string;

  constructor(init?: Partial<BaseResource>) {
    Object.assign(this, init);
  }
}
