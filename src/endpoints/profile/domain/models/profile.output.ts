import {
  removeUndefinedProperties,
  UnknownObject,
} from '@alien-worlds/api-core';

import { Profile } from '../entities/profile';

export class ProfileOutput {
  public static create(results?: Profile[], count?: number): ProfileOutput {
    return new ProfileOutput(results || [], count || 0);
  }

  private constructor(
    public readonly results: Profile[],
    public readonly count: number
  ) {}

  public toJSON(): UnknownObject {
    const { results, count } = this;

    const result = {
      results: results.map(e => this.parseProfileToResult(e)),
      count,
    };

    return removeUndefinedProperties(result);
  }

  /**
   * Get Json object from the entity
   *
   * @returns {object}
   */
  private parseProfileToResult(p: Profile) {
    const { blockNum, account, profile, error } = p;

    let output = {};

    if (error) {
      output = {
        account,
        error,
      };
    } else {
      output = {
        block_num: blockNum.toString(),
        account,
        profile: profile.toJSON(),
      };
    }

    return removeUndefinedProperties(output);
  }
}
