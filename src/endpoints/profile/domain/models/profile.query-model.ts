import { AggregateOptions, MongoAggregateParams, QueryModel } from '@alien-worlds/api-core';

import { ProfileQueryModelInput } from '../../data/dtos/profile.dto';

/*imports*/

/**
 * @class
 */
export class ProfileQueryModel extends QueryModel {
  /**
   * @returns {ProfileQueryModel}
   */
  public static create(model: ProfileQueryModelInput): ProfileQueryModel {
    const { custContract, dacId, accounts } = model;
    return new ProfileQueryModel(custContract, dacId, accounts);
  }

  /**
   * @constructor
   * @private
   */
  private constructor(
    public readonly custContract: string,
    public readonly dacId: string,
    public readonly accounts: string[],
  ) {
    super();
  }

  public toQueryParams(): MongoAggregateParams {
    const { custContract, dacId, accounts } = this;

    const pipeline: object[] = [
      {
        $match: {
          'action.account': custContract,
          'action.name': 'stprofile',
          'action.data.dac_id': dacId,
          'action.data.cand': { $in: accounts },
        }
      },
      { $sort: { block_num: -1 } },
      {
        $group: {
          _id: { cand: '$action.data.cand' },
          block_num: { $first: '$block_num' },
          profile: { $first: '$action.data.profile' },
          account: { $first: '$action.data.cand' },
          action: { $first: '$action' },
        },
      },
      { $sort: { block_num: -1 } },
    ];

    const options: AggregateOptions = {};

    return { pipeline, options };
  }
}
