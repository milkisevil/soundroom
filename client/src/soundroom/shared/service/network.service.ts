import { Injectable } from '@angular/core';
import { RequestOptions, Headers } from '@angular/http';

import { Observable } from 'rxjs/Observable';

@Injectable()
export class NetworkService {

  private JWT_STORAGE_KEY: string = 'soundroom.auth.jwt';

  /**
   * An exponential backoff strategy is used when loading playlist data, but we won't allow that exponential delay
   * exceed this value.
   * @type {number}
   */
  private MAX_RETRY_INTERVAL: number = 30;

  /**
   * On this number of retries (within the exponential backoff strategy), we will emit our slow connection. This may be
   * communicated to the user via UI.
   * @type {number}
   */
  private SLOW_CONNECTION_RETRIES: number = 2;

  /**
   * Use with the `retryWhen()` operator for an exponential backoff retry strategy
   *
   * @example
   *
   *     Observable.retryWhen(errors => this.retry(errors))
   *
   * @param errors
   * @returns {Observable<R>}
   */
  retry(errors: Observable<any>): Observable<any> {
    return errors
      .mergeMap((err, count) => {
        // Emit event if we've retried SLOW_CONNECTION_RETRIES times
        if (count === this.SLOW_CONNECTION_RETRIES) {
          console.warn('TODO: Slow Connection: Implement slow connection reducer logic');
          // this.onSlowConnection.emit(true);
        }

        // Calc number of seconds we'll retry in using incremental backoff
        const retrySecs = Math.min(Math.round(Math.pow(++count, 2)), this.MAX_RETRY_INTERVAL);
        console.warn(`NetworkService.retry: Retry ${count} in ${retrySecs} seconds`);

        // Set delay
        return Observable.of(err)
          .delay(retrySecs * 1000);
      });
  }

  /**
   * Other network reliant services should call this when the network has just completed a task.
   * If we're slowConnection state, it will be brought back to normal.
   */
  ok() {
    // TODO: Implement
  }

  /**
   * Standard options we need to use when sending POST requests to the server
   */
  get requestOptions() {

    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.jwt) {
      headers['Authorization'] = `JWT ${this.jwt}`;
    }

    return new RequestOptions({
      headers: new Headers(headers),
    });
  }

  /**
   * Cache the JWT that has just been received after a login.
   *
   * @param jwt
   */
  set jwt(jwt: string) {
    // console.log('NetworkService: set jwt():', jwt);
    localStorage.setItem(this.JWT_STORAGE_KEY, jwt);
  }

  get jwt() {
    // console.log('NetworkService: get jwt():', localStorage.getItem(this.JWT_STORAGE_KEY));
    return localStorage.getItem(this.JWT_STORAGE_KEY);
  }
}
