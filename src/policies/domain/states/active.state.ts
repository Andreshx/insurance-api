import { PolicyStatus } from '../models/policy-status.enum';
import { InvalidStateTransitionException } from '../exceptions/invalid-state-transition.exception';
import { PolicyStatePort } from './policy-state.port';
import { SuspendedState } from './suspended.state';
import { CancelledState } from './cancelled.state';

export class ActiveState extends PolicyStatePort {
  readonly status = PolicyStatus.ACTIVE;

  issue(): PolicyStatePort {
    throw new InvalidStateTransitionException(
      this.status,
      PolicyStatus.ISSUED,
    );
  }

  activate(): PolicyStatePort {
    return this;
  }

  suspend(): PolicyStatePort {
    return new SuspendedState();
  }

  cancel(): PolicyStatePort {
    return new CancelledState();
  }
}