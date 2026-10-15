import { PolicyStatus } from '../models/policy-status.enum';
import { InvalidStateTransitionException } from '../exceptions/invalid-state-transition.exception';
import { CancelledState } from './cancelled.state';

describe('CancelledState', () => {
  const state = new CancelledState();

  it('should have CANCELLED status', () => {
    expect(state.status).toBe(PolicyStatus.CANCELLED);
  });

  it('issue should throw InvalidStateTransitionException', () => {
    expect(() => state.issue()).toThrow(InvalidStateTransitionException);
  });

  it('activate should throw InvalidStateTransitionException', () => {
    expect(() => state.activate()).toThrow(InvalidStateTransitionException);
  });

  it('suspend should throw InvalidStateTransitionException', () => {
    expect(() => state.suspend()).toThrow(InvalidStateTransitionException);
  });

  it('cancel should return itself', () => {
    expect(state.cancel()).toBe(state);
  });
});
