import { Inject, Injectable } from '@nestjs/common';
import { CustomerRepositoryPort } from '../../../customers/domain/ports/customer-repository.port';
import { PolicyNumberSequencer } from '../../../shared/singletons/policy-number-sequencer';
import { InvalidPolicyDataException } from '../../domain/exceptions/invalid-policy-data.exception';
import { UnsupportedBranchException } from '../../domain/exceptions/unsupported-branch.exception';
import { UnsupportedRatingStrategyException } from '../../domain/exceptions/unsupported-rating-strategy.exception';
import { PolicyBranch } from '../../domain/models/policy-branch.enum';
import { PolicyModel } from '../../domain/models/policy.model';
import { RatingStrategyName } from '../../domain/models/rating-strategy-name.enum';
import { RiskProfile } from '../../domain/models/risk-profile.vo';
import { PolicyFactoryPort } from '../../domain/ports/policy-factory.port';
import { PolicyRepositoryPort } from '../../domain/ports/policy-repository.port';
import { RatingStrategyPort } from '../../domain/ports/rating-strategy.port';
import { PolicyBuilder } from '../builders/policy.builder';
import { CreatePolicyDto } from '../dtos/create-policy.dto';
import { POLICY_FACTORIES } from '../factories/policy-factories.token';
import { RATING_STRATEGIES } from '../strategies/rating-strategies.token';

@Injectable()
export class CreatePolicyUseCase {
  constructor(
    @Inject(CustomerRepositoryPort)
    private readonly customerRepository: CustomerRepositoryPort,

    @Inject(PolicyRepositoryPort)
    private readonly policyRepository: PolicyRepositoryPort,

    @Inject(POLICY_FACTORIES)
    private readonly policyFactories: Map<PolicyBranch, PolicyFactoryPort>,

    @Inject(RATING_STRATEGIES)
    private readonly ratingStrategies: Map<
      RatingStrategyName,
      RatingStrategyPort
    >,
  ) {}

  async execute(dto: CreatePolicyDto): Promise<PolicyModel> {
    const customer = await this.customerRepository.findById(dto.customerId);

    if (!customer) {
      throw new InvalidPolicyDataException(
        `Customer ${dto.customerId} does not exist`,
      );
    }

    if (!customer.getIsActive()) {
      throw new InvalidPolicyDataException(
        `Customer ${dto.customerId} is not active`,
      );
    }

    const factory = this.policyFactories.get(dto.branch);

    if (!factory) {
      throw new UnsupportedBranchException(dto.branch);
    }

    const strategy = this.ratingStrategies.get(dto.ratingStrategy);

    if (!strategy) {
      throw new UnsupportedRatingStrategyException(dto.ratingStrategy);
    }

    const coverage = factory.createDefaultCoverage();
    const baseMonthlyPremium = factory.getBaseMonthlyPremium();
    const riskProfile = new RiskProfile(dto.riskProfile);

    strategy.validate(riskProfile);

    const monthlyPremium = strategy.calculatePremium(
      baseMonthlyPremium,
      riskProfile,
    );

    const policyNumber = PolicyNumberSequencer.getInstance().next();

    const policy = new PolicyBuilder()
      .forCustomer(dto.customerId)
      .withPolicyNumber(policyNumber)
      .ofBranch(dto.branch)
      .withRatingStrategy(dto.ratingStrategy)
      .withCoverage(coverage)
      .withMonthlyPremium(monthlyPremium)
      .withRiskProfile(riskProfile)
      .build();

    return this.policyRepository.save(policy);
  }
}