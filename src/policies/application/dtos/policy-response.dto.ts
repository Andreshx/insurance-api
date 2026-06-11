import { ApiProperty } from '@nestjs/swagger';
import { PolicyBranch } from '../../domain/models/policy-branch.enum';
import { PolicyModel } from '../../domain/models/policy.model';
import { PolicyStatus } from '../../domain/models/policy-status.enum';
import { RatingStrategyName } from '../../domain/models/rating-strategy-name.enum';

export class PolicyResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  policyNumber!: string;

  @ApiProperty()
  customerId!: string;

  @ApiProperty({ enum: PolicyBranch })
  branch!: PolicyBranch;

  @ApiProperty({ enum: RatingStrategyName })
  ratingStrategy!: RatingStrategyName;

  @ApiProperty({ enum: PolicyStatus })
  status!: PolicyStatus;

  @ApiProperty()
  coverage!: Record<string, unknown>;

  @ApiProperty()
  monthlyPremium!: number;

  @ApiProperty()
  riskProfile!: Record<string, unknown>;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromDomain(policy: PolicyModel): PolicyResponseDto {
    const dto = new PolicyResponseDto();

    dto.id = policy.getId();
    dto.policyNumber = policy.getPolicyNumber();
    dto.customerId = policy.getCustomerId();
    dto.branch = policy.getBranch();
    dto.ratingStrategy = policy.getRatingStrategy();
    dto.status = policy.getCurrentState().status;
    dto.coverage = policy.getCoverage().getProperties();
    dto.monthlyPremium = policy.getMonthlyPremium();
    dto.riskProfile = policy.getRiskProfile().getProperties();
    dto.createdAt = policy.getCreatedAt();
    dto.updatedAt = policy.getUpdatedAt();

    return dto;
  }
}