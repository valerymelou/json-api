/**
 * Converts a snake_case or kebab-case string to camelCase.
 *
 * @param s - The input string in snake_case or kebab-case format
 * @returns The converted string in camelCase format
 *
 * @example
 * snakeToCamel('hello_world') // returns 'helloWorld'
 * snakeToCamel('hello-world') // returns 'helloWorld'
 */
export function snakeToCamel(s: string) {
  return s.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace(/-/g, '').replace(/_/g, '');
  });
}
