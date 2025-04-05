import { ApiError } from './api-error';

describe('HttpError', () => {
  it('should parse errors', () => {
    const errors = [
      {
        code: 'required',
        detail: 'Username is required',
        status: '400',
        source: {
          pointer: '/data/attributes/username',
        },
      },
    ];
    const httpErrors = ApiError.fromErrors(errors);

    expect(httpErrors.length).toEqual(1);
    expect(httpErrors[0].source).toEqual('username');
  });

  it('should parse errors without sources', () => {
    const errors = [
      {
        code: 'required',
        detail: 'Username is required',
        status: '400',
      },
    ];
    const httpErrors = ApiError.fromErrors(errors);

    expect(httpErrors.length).toEqual(1);
  });
});
