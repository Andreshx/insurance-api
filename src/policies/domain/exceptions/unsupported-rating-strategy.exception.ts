import { RatingStrategyName } from '../models/rating-strategy-name.enum';

export class UnsupportedRatingStrategyException extends Error {
  constructor(strategy: RatingStrategyName | string) {
    super(`Unsupported rating strategy: ${strategy}`);
    this.name = 'UnsupportedRatingStrategyException';
  }
}