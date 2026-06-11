export class InvalidPolicyDataException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPolicyDataException';
  }
}