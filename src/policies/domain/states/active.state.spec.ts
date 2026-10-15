import { PolicyStatus } from '../models/policy-status.enum';
import { InvalidStateTransitionException } from '../exceptions/invalid-state-transition.exception';
import { ActiveState } from './active.state';
import { SuspendedState } from './suspended.state';
import { CancelledState } from './cancelled.state';

describe('ActiveState', () => {
  const state = new ActiveState();

  it('should have ACTIVE status', () => {
    expect(state.status).toBe(PolicyStatus.ACTIVE);
  });

  it('issue should throw InvalidStateTransitionException', () => {
    expect(() => state.issue()).toThrow(InvalidStateTransitionException);
  });

  it('activate should return itself', () => {
    expect(state.activate()).toBe(state);
  });

  it('suspend should transition to SuspendedState', () => {
    expect(state.suspend()).toBeInstanceOf(SuspendedState);
  });

  it('cancel should transition to CancelledState', () => {
    expect(state.cancel()).toBeInstanceOf(CancelledState);
  });
});
