import { PolicyModel } from '../../domain/models/policy.model';
import { QuotedState } from '../../domain/states/quoted.state';
import { PolicyBranch } from '../../domain/models/policy-branch.enum';
import { RatingStrategyName } from '../../domain/models/rating-strategy-name.enum';
import { RiskProfile } from '../../domain/models/risk-profile.vo';
import { Coverage } from '../../domain/models/coverage.vo';
import { GetPoliciesUseCase } from './get-policies.use-case';

describe('GetPoliciesUseCase', () => {
  const mockRepository: any = {
    findAll: jest.fn(),
  };

  const useCase = new GetPoliciesUseCase(mockRepository);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an empty list when no policies exist', async () => {
    mockRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should return the list of all policies', async () => {
    const policies = [
      new PolicyModel(
        'id-1',
        'POL-20260101-000001',
        'customer-1',
        PolicyBranch.AUTO,
        RatingStrategyName.STANDARD,
        new QuotedState(),
        new Coverage({ coverageAmount: 80_000_000 }),
        120_000,
        new RiskProfile({}),
        new Date('2026-01-01'),
        new Date('2026-01-01'),
      ),
      new PolicyModel(
        'id-2',
        'POL-20260101-000002',
        'customer-1',
        PolicyBranch.LIFE,
        RatingStrategyName.STANDARD,
        new QuotedState(),
        new Coverage({ coverageAmount: 200_000_000 }),
        90_000,
        new RiskProfile({}),
        new Date('2026-01-01'),
        new Date('2026-01-01'),
      ),
    ];
    mockRepository.findAll.mockResolvedValue(policies);

    const result = await useCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalled();
    expect(result).toHaveLength(2);
    expect(result).toBe(policies);
    expect(result[0].getBranch()).toBe(PolicyBranch.AUTO);
    expect(result[1].getBranch()).toBe(PolicyBranch.LIFE);
  });
});
