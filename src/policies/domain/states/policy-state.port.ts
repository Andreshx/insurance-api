import { PolicyStatus } from '../models/policy-status.enum';

export abstract class PolicyStatePort {
  abstract readonly status: PolicyStatus;

  abstract issue(): PolicyStatePort;

  abstract activate(): PolicyStatePort;

  abstract suspend(): PolicyStatePort;

  abstract cancel(): PolicyStatePort;
}