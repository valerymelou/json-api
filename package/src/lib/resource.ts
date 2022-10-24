export interface Resource {
  type?: string;
  id?: string;
  attributes: Record<string, unknown>;
  relationships?: Record<string, {data: Resource|Resource[]}>;
}
