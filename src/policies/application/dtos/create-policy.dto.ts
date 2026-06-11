import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsUUID } from 'class-validator';
import { PolicyBranch } from '../../domain/models/policy-branch.enum';
import { RatingStrategyName } from '../../domain/models/rating-strategy-name.enum';

export class CreatePolicyDto {
  @ApiProperty({
    example: '7d21fef1-8a64-4a66-a7c5-b6c10f5d402d',
  })
  @IsUUID()
  customerId!: string;

  @ApiProperty({
    enum: PolicyBranch,
    example: PolicyBranch.AUTO,
  })
  @IsEnum(PolicyBranch)
  branch!: PolicyBranch;

  @ApiProperty({
    enum: RatingStrategyName,
    example: RatingStrategyName.STANDARD,
  })
  @IsEnum(RatingStrategyName)
  ratingStrategy!: RatingStrategyName;

  @ApiProperty({
    example: {
      riskScore: 30,
      customerSince: 2020,
    },
  })
  @IsObject()
  riskProfile!: Record<string, unknown>;
}