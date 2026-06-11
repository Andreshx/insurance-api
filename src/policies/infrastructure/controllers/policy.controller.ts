import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePolicyDto } from '../../application/dtos/create-policy.dto';
import { PolicyResponseDto } from '../../application/dtos/policy-response.dto';
import { CreatePolicyUseCase } from '../../application/use-case/create-policy.use-case';

@ApiTags('policies')
@Controller('policies')
export class PolicyController {
  constructor(
    private readonly createPolicyUseCase: CreatePolicyUseCase,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: PolicyResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid customer, branch, rating strategy or risk profile',
  })
  async create(
    @Body() createPolicyDto: CreatePolicyDto,
  ): Promise<PolicyResponseDto> {
    const policy = await this.createPolicyUseCase.execute(createPolicyDto);

    return PolicyResponseDto.fromDomain(policy);
  }
}