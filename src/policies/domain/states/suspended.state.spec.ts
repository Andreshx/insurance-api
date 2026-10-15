import { PolicyStatus } from '../models/policy-status.enum';
import { InvalidStateTransitionException } from '../exceptions/invalid-state-transition.exception';
import { SuspendedState } from './suspended.state';
import { ActiveState } from './active.state';
import { CancelledState } from './cancelled.state';

describe('SuspendedState', () => {
  const state = new SuspendedState();

  it('should have SUSPENDED status', () => {
    expect(state.status).toBe(PolicyStatus.SUSPENDED);
  });

  it('issue should throw InvalidStateTransitionException', () => {
    expect(() => state.issue()).toThrow(InvalidStateTransitionException);
  });

  it('activate should transition to ActiveState', () => {
    expect(state.activate()).toBeInstanceOf(ActiveState);
  });

  it('suspend should return itself', () => {
    expect(state.suspend()).toBe(state);
  });

  it('cancel should transition to CancelledState', () => {
    expect(state.cancel()).toBeInstanceOf(CancelledState);
  });
});
