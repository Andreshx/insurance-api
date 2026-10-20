import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCustomerDto } from '../../application/dtos/create-customer.dto';
import { CustomerResponseDto } from '../../application/dtos/customer-response.dto';
import { UpdateCustomerDto } from '../../application/dtos/update-customer.dto';
import { CreateCustomerUseCase } from '../../application/use-cases/create-customer.use-case';
import { GetCustomerByIdUseCase } from '../../application/use-cases/get-customer-by-id.use-case';
import { GetCustomersUseCase } from '../../application/use-cases/get-customers.use-case';
import { UpdateCustomerUseCase } from '../../application/use-cases/update-customer.use-case';

@ApiTags('customers')
@Controller('customers')
export class CustomerController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly getCustomerByIdUseCase: GetCustomerByIdUseCase,
    private readonly getCustomersUseCase: GetCustomersUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: CustomerResponseDto })
  @ApiConflictResponse({ description: 'Email already exists' })
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    const customer =
      await this.createCustomerUseCase.execute(createCustomerDto);

    return CustomerResponseDto.fromDomain(customer);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: [CustomerResponseDto] })
  async findAll(): Promise<CustomerResponseDto[]> {
    const customers = await this.getCustomersUseCase.execute();

    return customers.map((customer) =>
      CustomerResponseDto.fromDomain(customer),
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: CustomerResponseDto })
  @ApiNotFoundResponse({ description: 'Customer not found' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CustomerResponseDto> {
    const customer = await this.getCustomerByIdUseCase.execute(id);

    return CustomerResponseDto.fromDomain(customer);
  }

  @Patch(':id')
  @ApiOkResponse({ type: CustomerResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid data' })
  @ApiNotFoundResponse({ description: 'Customer not found' })
  @ApiConflictResponse({ description: 'Email already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    const customer = await this.updateCustomerUseCase.execute(
      id,
      updateCustomerDto,
    );

    return CustomerResponseDto.fromDomain(customer);
  }
}
