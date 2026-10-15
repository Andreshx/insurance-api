import { PolicyNumberSequencer } from '../../../shared/singletons/policy-number-sequencer';
import { InvalidPolicyDataException } from '../../domain/exceptions/invalid-policy-data.exception';
import { UnsupportedBranchException } from '../../domain/exceptions/unsupported-branch.exception';
import { UnsupportedRatingStrategyException } from '../../domain/exceptions/unsupported-rating-strategy.exception';
import { PolicyBranch } from '../../domain/models/policy-branch.enum';
import { RatingStrategyName } from '../../domain/models/rating-strategy-name.enum';
import { RiskProfile } from '../../domain/models/risk-profile.vo';
import { PolicyFactoryPort } from '../../domain/ports/policy-factory.port';
import { RatingStrategyPort } from '../../domain/ports/rating-strategy.port';
import { CreatePolicyDto } from '../dtos/create-policy.dto';
import { CreatePolicyUseCase } from './create-policy.use-case';

describe('CreatePolicyUseCase', () => {
  const mockCustomerRepository: any = {
    findById: jest.fn(),
  };

  const mockPolicyRepository: any = {
    save: jest.fn(),
  };

  const mockFactory: any = {
    createDefaultCoverage: jest.fn(),
    getBaseMonthlyPremium: jest.fn(),
  };

  const mockStrategy: any = {
    validate: jest.fn(),
    calculatePremium: jest.fn(),
  };

  const factories = new Map<PolicyBranch, PolicyFactoryPort>([
    [PolicyBranch.AUTO, mockFactory],
  ]);

  const strategies = new Map<RatingStrategyName, RatingStrategyPort>([
    [RatingStrategyName.STANDARD, mockStrategy],
  ]);

  const useCase = new CreatePolicyUseCase(
    mockCustomerRepository,
    mockPolicyRepository,
    factories,
    strategies,
  );

  const baseDto: CreatePolicyDto = {
    customerId: 'customer-1',
    branch: PolicyBranch.AUTO,
    ratingStrategy: RatingStrategyName.STANDARD,
    riskProfile: {},
  };

  beforeEach(() => {
    jest.resetAllMocks();
    mockCustomerRepository.findById.mockResolvedValue({
      getIsActive: () => true,
    });
    mockFactory.createDefaultCoverage.mockReturnValue({});
    mockFactory.getBaseMonthlyPremium.mockReturnValue(120_000);
    mockStrategy.calculatePremium.mockReturnValue(120_000);
    mockStrategy.validate.mockReturnValue(undefined);
  });

  it('should create a policy for an active customer', async () => {
    const savedPolicy = { id: 'policy-1' };
    mockPolicyRepository.save.mockResolvedValue(savedPolicy);

    const result = await useCase.execute(baseDto);

    expect(mockCustomerRepository.findById).toHaveBeenCalledWith('customer-1');
    expect(mockStrategy.validate).toHaveBeenCalled();
    expect(mockStrategy.calculatePremium).toHaveBeenCalledWith(
      120_000,
      expect.any(RiskProfile),
    );
    expect(mockPolicyRepository.save).toHaveBeenCalled();
    expect(result).toBe(savedPolicy);
  });

  it('should throw InvalidPolicyDataException when customer does not exist', async () => {
    mockCustomerRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(baseDto)).rejects.toThrow(
      InvalidPolicyDataException,
    );
    expect(mockPolicyRepository.save).not.toHaveBeenCalled();
  });

  it('should throw InvalidPolicyDataException when customer is not active', async () => {
    mockCustomerRepository.findById.mockResolvedValue({
      getIsActive: () => false,
    });

    await expect(useCase.execute(baseDto)).rejects.toThrow(
      InvalidPolicyDataException,
    );
  });

  it('should throw UnsupportedBranchException when branch is not supported', async () => {
    const dto: CreatePolicyDto = {
      ...baseDto,
      branch: PolicyBranch.LIFE,
    };

    await expect(useCase.execute(dto)).rejects.toThrow(
      UnsupportedBranchException,
    );
  });

  it('should throw UnsupportedRatingStrategyException when strategy is not supported', async () => {
    const dto: CreatePolicyDto = {
      ...baseDto,
      ratingStrategy: RatingStrategyName.LOYALTY,
    };

    await expect(useCase.execute(dto)).rejects.toThrow(
      UnsupportedRatingStrategyException,
    );
  });

  it('should throw InvalidPolicyDataException when strategy validation fails', async () => {
    mockStrategy.validate.mockImplementation(() => {
      throw new InvalidPolicyDataException('invalid risk profile');
    });

    await expect(useCase.execute(baseDto)).rejects.toThrow(
      InvalidPolicyDataException,
    );
  });

  it('should use PolicyNumberSequencer for policy number', async () => {
    const spy = jest
      .spyOn(PolicyNumberSequencer.getInstance(), 'next')
      .mockReturnValue('POL-20260101-000001');
    const savedPolicy = { id: 'policy-1' };
    mockPolicyRepository.save.mockResolvedValue(savedPolicy);

    await useCase.execute(baseDto);

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should calculate premium using the strategy', async () => {
    mockStrategy.calculatePremium.mockReturnValue(150_000);
    const savedPolicy = { id: 'policy-1' };
    mockPolicyRepository.save.mockResolvedValue(savedPolicy);

    await useCase.execute(baseDto);

    expect(mockStrategy.calculatePremium).toHaveBeenCalledWith(
      120_000,
      expect.any(RiskProfile),
    );
  });
});
