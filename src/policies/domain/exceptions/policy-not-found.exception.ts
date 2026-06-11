export class PolicyNotFoundException extends Error {
  constructor(policyId: string) {
    super(`Policy with id ${policyId} was not found`);
    this.name = 'PolicyNotFoundException';
  }
}