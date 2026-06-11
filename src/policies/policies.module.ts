import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from '../customers/customers.module';
import { AutoPolicyFactory } from './application/factories/auto-policy.factory';
import { HealthPolicyFactory } from './application/factories/health-policy.factory';
import { HomePolicyFactory } from './application/factories/home-policy.factory';
import { LifePolicyFactory } from './application/factories/life-policy.factory';
import { POLICY_FACTORIES } from './application/factories/policy-factories.token';
import { CreatePolicyUseCase } from '../policies/application/use-case/create-policy.use-case';
import { LoyaltyRatingStrategy } from './application/strategies/loyalty-rating.strategy';
import { RATING_STRATEGIES } from './application/strategies/rating-strategies.token';
import { RiskBasedRatingStrategy } from './application/strategies/risk-based-rating.strategy';
import { StandardRatingStrategy } from './application/strategies/standard-rating.strategy';
import { PolicyBranch } from './domain/models/policy-branch.enum';
import { RatingStrategyName } from './domain/models/rating-strategy-name.enum';
import { PolicyFactoryPort } from './domain/ports/policy-factory.port';
import { PolicyRepositoryPort } from './domain/ports/policy-repository.port';
import { RatingStrategyPort } from './domain/ports/rating-strategy.port';
import { PolicyController } from './infrastructure/controllers/policy.controller';
import { PolicyMapper } from './infrastructure/persistence/policy.mapper';
import { PolicyTypeormEntity } from './infrastructure/persistence/policy.typeorm-entity';
import { PolicyTypeormRepository } from './infrastructure/persistence/policy.typeorm-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([PolicyTypeormEntity]),
    CustomersModule,
  ],
  controllers: [PolicyController],
  providers: [
    PolicyMapper,
    CreatePolicyUseCase,

    AutoPolicyFactory,
    LifePolicyFactory,
    HomePolicyFactory,
    HealthPolicyFactory,

    StandardRatingStrategy,
    RiskBasedRatingStrategy,
    LoyaltyRatingStrategy,

    {
      provide: PolicyRepositoryPort,
      useClass: PolicyTypeormRepository,
    },

    {
      provide: POLICY_FACTORIES,
      useFactory: (
        autoFactory: AutoPolicyFactory,
        lifeFactory: LifePolicyFactory,
        homeFactory: HomePolicyFactory,
        healthFactory: HealthPolicyFactory,
      ): Map<PolicyBranch, PolicyFactoryPort> =>
        new Map<PolicyBranch, PolicyFactoryPort>([
          [autoFactory.getBranch(), autoFactory],
          [lifeFactory.getBranch(), lifeFactory],
          [homeFactory.getBranch(), homeFactory],
          [healthFactory.getBranch(), healthFactory],
        ]),
      inject: [
        AutoPolicyFactory,
        LifePolicyFactory,
        HomePolicyFactory,
        HealthPolicyFactory,
      ],
    },

    {
      provide: RATING_STRATEGIES,
      useFactory: (
        standardStrategy: StandardRatingStrategy,
        riskBasedStrategy: RiskBasedRatingStrategy,
        loyaltyStrategy: LoyaltyRatingStrategy,
      ): Map<RatingStrategyName, RatingStrategyPort> =>
        new Map<RatingStrategyName, RatingStrategyPort>([
          [standardStrategy.getName(), standardStrategy],
          [riskBasedStrategy.getName(), riskBasedStrategy],
          [loyaltyStrategy.getName(), loyaltyStrategy],
        ]),
      inject: [
        StandardRatingStrategy,
        RiskBasedRatingStrategy,
        LoyaltyRatingStrategy,
      ],
    },
  ],
  exports: [PolicyRepositoryPort],
})
export class PoliciesModule {}