import { PolicyStatus } from '../models/policy-status.enum';
import { InvalidStateTransitionException } from '../exceptions/invalid-state-transition.exception';
import { PolicyStatePort } from './policy-state.port';
import { IssuedState } from './issued.state';
import { CancelledState } from './cancelled.state';

export class QuotedState extends PolicyStatePort {
  readonly status = PolicyStatus.QUOTED;

  issue(): PolicyStatePort {
    return new IssuedState();
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
    return new CancelledState();
  }
}