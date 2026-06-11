import { PolicyStatus } from '../models/policy-status.enum';
import { InvalidStateTransitionException } from '../exceptions/invalid-state-transition.exception';
import { PolicyStatePort } from './policy-state.port';

export class CancelledState extends PolicyStatePort {
  readonly status = PolicyStatus.CANCELLED;

  issue(): PolicyStatePort {
    throw new InvalidStateTransitionException(
      this.status,
      PolicyStatus.ISSUED,
    );
  }

  activate(): PolicyStatePort {
    throw new InvalidStateTransitionException(
      this.status,
      PolicyStatus.ACTIVE,
    );
  }

  suspend(): PolicyStatePort {
    throw new InvalidStateTransitionException(
      this.status,
      PolicyStatus.SUSPENDED,
    );
  }

  cancel(): PolicyStatePort {
    return this;
  }
}