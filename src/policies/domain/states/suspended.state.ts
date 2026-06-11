import { PolicyStatus } from '../models/policy-status.enum';
import { InvalidStateTransitionException } from '../exceptions/invalid-state-transition.exception';
import { PolicyStatePort } from './policy-state.port';
import { ActiveState } from './active.state';
import { CancelledState } from './cancelled.state';

export class SuspendedState extends PolicyStatePort {
  readonly status = PolicyStatus.SUSPENDED;

  issue(): PolicyStatePort {
    throw new InvalidStateTransitionException(
      this.status,
      PolicyStatus.ISSUED,
    );
  }

  activate(): PolicyStatePort {
    return new ActiveState();
  }

  suspend(): PolicyStatePort {
    return this;
  }

  cancel(): PolicyStatePort {
    return new CancelledState();
  }
}