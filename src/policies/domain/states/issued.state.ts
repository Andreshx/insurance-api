import { PolicyStatus } from '../models/policy-status.enum';
import { InvalidStateTransitionException } from '../exceptions/invalid-state-transition.exception';
import { PolicyStatePort } from './policy-state.port';
import { ActiveState } from './active.state';
import { CancelledState } from './cancelled.state';

export class IssuedState extends PolicyStatePort {
  readonly status = PolicyStatus.ISSUED;

  issue(): PolicyStatePort {
    return this;
  }

  activate(): PolicyStatePort {
    return new ActiveState();
  }

  suspend(): PolicyStatePort {
    throw new InvalidStateTransitionException(
      this.status,
      PolicyStatus.SUSPENDED,
    );
  }

  cancel(): PolicyStatePort {
    return new CancelledState();
  }
}