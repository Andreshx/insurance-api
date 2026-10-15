import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PolicyStatus } from '../../domain/models/policy-status.enum';

export class ChangePolicyStatusDto {
  @ApiProperty({
    enum: PolicyStatus,
    example: PolicyStatus.ISSUED,
  })
  @IsEnum(PolicyStatus)
  targetStatus!: PolicyStatus;
}
