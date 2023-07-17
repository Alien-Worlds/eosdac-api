import * as DaoWorldsCommon from '@alien-worlds/dao-worlds-common';

import {
  MongoCollectionSource,
  MongoSource,
} from '@alien-worlds/storage-mongodb';

/**
 * NFTs data source from the mongo database
 * @class
 */
export class FlagMongoSource extends MongoCollectionSource<DaoWorldsCommon.Actions.Types.FlagcandprofMongoModel> {
  public static Token = 'FLAG_MONGO_SOURCE';

  /**
   * @constructor
   * @param {MongoSource} mongoSource
   */
  constructor(mongoSource: MongoSource) {
    super(mongoSource, 'flags');
  }
}
