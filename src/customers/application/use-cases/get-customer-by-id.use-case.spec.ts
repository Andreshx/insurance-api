import { CustomerNotFoundException } from '../../domain/exceptions/customer-not-found.exception';
import { CustomerModel } from '../../domain/models/customer.model';
import { GetCustomerByIdUseCase } from './get-customer-by-id.use-case';

describe('GetCustomerByIdUseCase', () => {
  const mockRepository: any = {
    findById: jest.fn(),
  };

  const useCase = new GetCustomerByIdUseCase(mockRepository);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the customer when found', async () => {
    const customer = new CustomerModel(
      'id-1',
      'Andres',
      'a@e.com',
      true,
      new Date(),
      new Date(),
    );
    mockRepository.findById.mockResolvedValue(customer);

    const result = await useCase.execute('id-1');

    expect(mockRepository.findById).toHaveBeenCalledWith('id-1');
    expect(result).toBe(customer);
    expect(result.getName()).toBe('Andres');
  });

  it('should throw CustomerNotFoundException when not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('unknown')).rejects.toThrow(
      CustomerNotFoundException,
    );
  });
});
