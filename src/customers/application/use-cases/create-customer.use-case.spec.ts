import { EmailAlreadyExistsException } from '../../domain/exceptions/email-already-exists.exception';
import { CustomerModel } from '../../domain/models/customer.model';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { CreateCustomerUseCase } from './create-customer.use-case';

describe('CreateCustomerUseCase', () => {
  const mockRepository: any = {
    findByEmail: jest.fn(),
    save: jest.fn(),
  };

  const useCase = new CreateCustomerUseCase(mockRepository);

  const dto: CreateCustomerDto = {
    name: 'Andres Espinosa',
    email: 'andres@example.com',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create and save a new customer when email is available', async () => {
    mockRepository.findByEmail.mockResolvedValue(null);
    const savedCustomer = new CustomerModel(
      'id-1',
      dto.name,
      dto.email,
      true,
      new Date(),
      new Date(),
    );
    mockRepository.save.mockResolvedValue(savedCustomer);

    const result = await useCase.execute(dto);

    expect(mockRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(mockRepository.save).toHaveBeenCalled();
    expect(result).toBe(savedCustomer);
    expect(result.getEmail()).toBe(dto.email);
    expect(result.getIsActive()).toBe(true);
  });

  it('should throw EmailAlreadyExistsException when email already exists', async () => {
    const existing = new CustomerModel(
      'id-2',
      'Other',
      dto.email,
      true,
      new Date(),
      new Date(),
    );
    mockRepository.findByEmail.mockResolvedValue(existing);

    await expect(useCase.execute(dto)).rejects.toThrow(
      EmailAlreadyExistsException,
    );
    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});
