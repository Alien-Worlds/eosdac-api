/* eslint-disable @typescript-eslint/no-explicit-any */
// Unit Test Code
import { anything, instance, mock, verify, when } from 'ts-mockito';

import { DaoWorldsContract } from '@alien-worlds/dao-api-common';
import { Failure } from '@alien-worlds/api-core';
import { GetVotedCandidateIdsUseCase } from '../get-voted-candidate-ids.use-case';

describe('GetCandidatesUseCase', () => {
  let useCase: GetVotedCandidateIdsUseCase;
  let daoWorldsContractService: DaoWorldsContract.Services.DaoWorldsContractService;

  beforeEach(() => {
    daoWorldsContractService = mock(
      DaoWorldsContract.Services.DaoWorldsContractServiceImpl
    );
    useCase = new GetVotedCandidateIdsUseCase(
      instance(daoWorldsContractService)
    );
  });

  it('should return a list of candidates', async () => {
    const dacId = 'dacid';
    const walletId = 'somewalletid';

    when(daoWorldsContractService.fetchVote(anything())).thenResolve({
      content: [{ candidates: ['candidate1', 'candidate2', 'candidate3'] }],
    } as any);

    const result = await useCase.execute(walletId, dacId);

    expect(result.content).toBeInstanceOf(Array);

    verify(daoWorldsContractService.fetchVote(anything())).once();
  });

  it('should return an empty array if no candidates are found', async () => {
    const dacId = 'nonexistentdacid';
    const walletId = 'somewalletid';

    when(daoWorldsContractService.fetchVote(anything())).thenResolve({
      content: [{ candidates: [] }],
    } as any);

    const result = await useCase.execute(walletId, dacId);

    expect(result.content).toStrictEqual([]);

    verify(daoWorldsContractService.fetchVote(anything())).once();
  });

  it('should return an empty array if an error occurs', async () => {
    const dacId = 'nonexistentdacid';
    const walletId = 'somewalletid';

    when(daoWorldsContractService.fetchVote(anything())).thenResolve({
      failure: Failure.withMessage('error'),
    } as any);

    const result = await useCase.execute(walletId, dacId);

    expect(result).not.toBeNull();
    expect(result.content).toBeFalsy();

    verify(daoWorldsContractService.fetchVote(anything())).once();
  });
});
