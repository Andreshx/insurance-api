import { PolicyStatus } from '../models/policy-status.enum';

export class InvalidStateTransitionException extends Error {
  constructor(
    currentStatus: PolicyStatus,
    targetStatus: PolicyStatus,
  ) {
    super(
      `Invalid policy state transition from ${currentStatus} to ${targetStatus}`,
    );
    this.name = 'InvalidStateTransitionException';
  }
}