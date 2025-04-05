/**
 * Represents the links object in a JSON:API response
 * Contains pagination links for navigating through resource collections
 */
export class Links {
  public first: string | null = null;
  public last: string | null = null;
  public next: string | null = null;
  public prev: string | null = null;

  constructor(init?: Partial<Links>) {
    Object.assign(this, init);
  }
}
