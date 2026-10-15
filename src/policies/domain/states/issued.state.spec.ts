import { PolicyStatus } from '../models/policy-status.enum';
import { InvalidStateTransitionException } from '../exceptions/invalid-state-transition.exception';
import { IssuedState } from './issued.state';
import { ActiveState } from './active.state';
import { CancelledState } from './cancelled.state';

describe('IssuedState', () => {
  const state = new IssuedState();

  it('should have ISSUED status', () => {
    expect(state.status).toBe(PolicyStatus.ISSUED);
  });

  it('issue should return itself', () => {
    expect(state.issue()).toBe(state);
  });

  it('activate should transition to ActiveState', () => {
    expect(state.activate()).toBeInstanceOf(ActiveState);
  });

  it('suspend should throw InvalidStateTransitionException', () => {
    expect(() => state.suspend()).toThrow(InvalidStateTransitionException);
  });

  it('cancel should transition to CancelledState', () => {
    expect(state.cancel()).toBeInstanceOf(CancelledState);
  });
});
