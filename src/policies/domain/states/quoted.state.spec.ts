import { PolicyStatus } from '../models/policy-status.enum';
import { InvalidStateTransitionException } from '../exceptions/invalid-state-transition.exception';
import { QuotedState } from './quoted.state';
import { IssuedState } from './issued.state';
import { CancelledState } from './cancelled.state';

describe('QuotedState', () => {
  const state = new QuotedState();

  it('should have QUOTED status', () => {
    expect(state.status).toBe(PolicyStatus.QUOTED);
  });

  it('issue should transition to IssuedState', () => {
    expect(state.issue()).toBeInstanceOf(IssuedState);
  });

  it('activate should throw InvalidStateTransitionException', () => {
    expect(() => state.activate()).toThrow(InvalidStateTransitionException);
  });

  it('suspend should throw InvalidStateTransitionException', () => {
    expect(() => state.suspend()).toThrow(InvalidStateTransitionException);
  });

  it('cancel should transition to CancelledState', () => {
    expect(state.cancel()).toBeInstanceOf(CancelledState);
  });
});
