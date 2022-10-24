import { Pagination } from './pagination';
import { Model } from './model';

export class Results<T extends Model> {
  public included?: [];
  public data: T[] = [];
  public pagination: Pagination = new Pagination();
}
