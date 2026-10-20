import { CustomerNotFoundException } from '../../domain/exceptions/customer-not-found.exception';
import { EmailAlreadyExistsException } from '../../domain/exceptions/email-already-exists.exception';
import { CustomerModel } from '../../domain/models/customer.model';
import { UpdateCustomerUseCase } from './update-customer.use-case';

describe('UpdateCustomerUseCase', () => {
  const mockRepository: any = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    save: jest.fn(),
  };

  const useCase = new UpdateCustomerUseCase(mockRepository);

  const existing = new CustomerModel(
    'id-1',
    'Andres Espinosa',
    'andres@example.com',
    true,
    new Date('2026-01-01'),
    new Date('2026-01-01'),
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update the name when only name is provided', async () => {
    mockRepository.findById.mockResolvedValue(existing);
    mockRepository.save.mockImplementation((c: CustomerModel) =>
      Promise.resolve(c),
    );

    const result = await useCase.execute('id-1', { name: 'Nuevo Nombre' });

    expect(result.getName()).toBe('Nuevo Nombre');
    expect(result.getEmail()).toBe('andres@example.com');
    expect(result.getCreatedAt()).toEqual(existing.getCreatedAt());
    expect(mockRepository.save).toHaveBeenCalled();
  });

  it('should normalize the email to lowercase and trim', async () => {
    mockRepository.findById.mockResolvedValue(existing);
    mockRepository.findByEmail.mockResolvedValue(null);
    mockRepository.save.mockImplementation((c: CustomerModel) =>
      Promise.resolve(c),
    );

    const result = await useCase.execute('id-1', {
      email: '  Nuevo@Example.COM  ',
    });

    expect(result.getEmail()).toBe('nuevo@example.com');
    expect(mockRepository.findByEmail).toHaveBeenCalledWith(
      'nuevo@example.com',
    );
  });

  it('should not check for duplicate email when email is unchanged', async () => {
    mockRepository.findById.mockResolvedValue(existing);
    mockRepository.save.mockImplementation((c: CustomerModel) =>
      Promise.resolve(c),
    );

    const result = await useCase.execute('id-1', {
      email: 'andres@example.com',
    });

    expect(result.getEmail()).toBe('andres@example.com');
    expect(mockRepository.findByEmail).not.toHaveBeenCalled();
  });

  it('should throw EmailAlreadyExistsException when the new email belongs to another customer', async () => {
    const other = new CustomerModel(
      'id-2',
      'Other',
      'taken@example.com',
      true,
      new Date(),
      new Date(),
    );
    mockRepository.findById.mockResolvedValue(existing);
    mockRepository.findByEmail.mockResolvedValue(other);

    await expect(
      useCase.execute('id-1', { email: 'taken@example.com' }),
    ).rejects.toThrow(EmailAlreadyExistsException);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should throw CustomerNotFoundException when the customer does not exist', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing', { name: 'X' })).rejects.toThrow(
      CustomerNotFoundException,
    );
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should keep createdAt and update updatedAt', async () => {
    const before = new Date();
    mockRepository.findById.mockResolvedValue(existing);
    mockRepository.save.mockImplementation((c: CustomerModel) =>
      Promise.resolve(c),
    );

    const result = await useCase.execute('id-1', { name: 'Updated' });

    expect(result.getCreatedAt()).toEqual(existing.getCreatedAt());
    expect(result.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
      before.getTime(),
    );
  });
});
