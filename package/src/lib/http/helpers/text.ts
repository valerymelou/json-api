export function snakeToCamel(s: string) {
  return s.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace(/-/g, '')
      .replace(/_/g, '');
  });
}
