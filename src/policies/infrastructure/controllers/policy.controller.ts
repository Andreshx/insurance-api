import { Body, Controller, Post, Get, Param, Patch } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePolicyDto } from '../../application/dtos/create-policy.dto';
import { PolicyResponseDto } from '../../application/dtos/policy-response.dto';
import { CreatePolicyUseCase } from '../../application/use-case/create-policy.use-case';
import { ApiNotFoundResponse, ApiOkResponse } from '@nestjs/swagger';
import { GetPolicyByIdUseCase } from '../../application/use-case/get-policy-by-id.use-case';
import { GetPoliciesByCustomerUseCase } from '../../application/use-case/get-policies-by-customer.use-case';
import { ChangePolicyStatusDto } from '../../application/dtos/change-policy-status.dto';
import { ChangePolicyStatusUseCase } from '../../application/use-case/change-policy-status.use-case';




@ApiTags('policies')
@Controller('policies')
export class PolicyController {
  constructor(
    private readonly createPolicyUseCase: CreatePolicyUseCase,
    private readonly getPolicyByIdUseCase: GetPolicyByIdUseCase,
    private readonly getPoliciesByCustomerUseCase: GetPoliciesByCustomerUseCase,
    private readonly changePolicyStatusUseCase: ChangePolicyStatusUseCase,
  ) { }

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

  @Get(':id')
  @ApiOkResponse({ type: PolicyResponseDto })
  @ApiNotFoundResponse({ description: 'Policy not found' })
  async getById(
    @Param('id') id: string,
  ): Promise<PolicyResponseDto> {
    const policy = await this.getPolicyByIdUseCase.execute(id);

    return PolicyResponseDto.fromDomain(policy);
  }

  @Get('customer/:customerId')
  @ApiOkResponse({ type: [PolicyResponseDto] })
  async getByCustomer(
    @Param('customerId') customerId: string,
  ): Promise<PolicyResponseDto[]> {
    const policies = await this.getPoliciesByCustomerUseCase.execute(customerId);

    return policies.map((policy) => PolicyResponseDto.fromDomain(policy));
  }

  @Patch(':id/status')
  @ApiOkResponse({ type: PolicyResponseDto })
  @ApiNotFoundResponse({ description: 'Policy not found' })
  @ApiBadRequestResponse({
    description: 'Invalid status transition',
  })
  async changeStatus(
    @Param('id') id: string,
    @Body() changePolicyStatusDto: ChangePolicyStatusDto,
  ): Promise<PolicyResponseDto> {
    const policy = await this.changePolicyStatusUseCase.execute(id, changePolicyStatusDto);

    return PolicyResponseDto.fromDomain(policy);
  }
}