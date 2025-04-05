import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '@vmelou/jsonapi';

import { BaseMixin } from './base.mixin';

describe('BaseMixin', () => {
  let baseMixin: BaseMixin;

  beforeEach(() => {
    baseMixin = new BaseMixin();
  });

  it('should handle client-side or network errors', () => {
    const error = new HttpErrorResponse({
      error: new ProgressEvent('error'),
    });

    baseMixin['handleErrors'](error).subscribe((errors) => {
      expect(errors).toEqual([new ApiError('', 'error', '0')]);
    });
  });

  it('should handle backend errors', () => {
    const error = new HttpErrorResponse({
      error: { errors: ['Error 1', 'Error 2'] },
    });

    baseMixin['handleErrors'](error).subscribe((errors) => {
      expect(errors).toEqual([
        new ApiError('Error 1'),
        new ApiError('Error 2'),
      ]);
    });
  });
});
