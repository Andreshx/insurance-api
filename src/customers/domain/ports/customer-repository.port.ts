import { CustomerModel } from '../models/customer.model';

export abstract class CustomerRepositoryPort {
  abstract save(customer: CustomerModel): Promise<CustomerModel>;

  abstract findById(id: string): Promise<CustomerModel | null>;

  abstract findByEmail(email: string): Promise<CustomerModel | null>;
}