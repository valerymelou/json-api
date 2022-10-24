import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from './http.service';
import { HttpError } from './http-error';

describe('HttpService', () => {
  it('should create an instance', () => {
    expect(new HttpService()).toBeTruthy();
  });

  it('should handle client errors', () => {
    const service = new HttpService();
    const handleError = service['handleError'];
    const errorEvent = new ProgressEvent('not-connected');
    const error = new HttpErrorResponse({error: errorEvent, status: 0});

    handleError(error).subscribe({
      error: (errors: HttpError[]) => {
        expect(errors.length).toEqual(1);
      }
    });
  });

  it('should handle server errors', () => {
    const service = new HttpService();
    const handleError = service['handleError'];
    const error = new HttpErrorResponse({error: {errors: [
      {
        code: 'required',
        detail: 'Username is required',
        status: '400',
        source: {
          pointer: '/data/attributes/username'
        }
      }
    ]}});

    handleError(error).subscribe({
      error: (errors: HttpError[]) => {
        expect(errors.length).toEqual(1);
        expect(errors[0].detail).toEqual('Username is required');
      }
    });
  });
});
