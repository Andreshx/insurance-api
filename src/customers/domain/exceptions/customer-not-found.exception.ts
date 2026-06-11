export class CustomerNotFoundException extends Error {
  constructor(customerId: string) {
    super(`Customer with id ${customerId} was not found`);
    this.name = 'CustomerNotFoundException';
  }
}