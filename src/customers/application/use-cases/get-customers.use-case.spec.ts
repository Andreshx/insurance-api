import { CustomerModel } from '../../domain/models/customer.model';
import { GetCustomersUseCase } from './get-customers.use-case';

describe('GetCustomersUseCase', () => {
  const mockRepository: any = {
    findAll: jest.fn(),
  };

  const useCase = new GetCustomersUseCase(mockRepository);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an empty list when no customers exist', async () => {
    mockRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should return the list of all customers', async () => {
    const customers = [
      new CustomerModel(
        'id-1',
        'Andres',
        'a@e.com',
        true,
        new Date(),
        new Date(),
      ),
      new CustomerModel(
        'id-2',
        'Maria',
        'm@e.com',
        true,
        new Date(),
        new Date(),
      ),
    ];
    mockRepository.findAll.mockResolvedValue(customers);

    const result = await useCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalled();
    expect(result).toHaveLength(2);
    expect(result).toBe(customers);
    expect(result[0].getName()).toBe('Andres');
    expect(result[1].getName()).toBe('Maria');
  });
});
