import { BadRequestException } from '@nestjs/common';
import { DomainExceptionFilter } from './domain-exception.filter';
import { InvalidPolicyDataException } from '../../policies/domain/exceptions/invalid-policy-data.exception';
import { InvalidStateTransitionException } from '../../policies/domain/exceptions/invalid-state-transition.exception';
import { PolicyNotFoundException } from '../../policies/domain/exceptions/policy-not-found.exception';
import { CustomerNotFoundException } from '../../customers/domain/exceptions/customer-not-found.exception';
import { EmailAlreadyExistsException } from '../../customers/domain/exceptions/email-already-exists.exception';
import { UnsupportedBranchException } from '../../policies/domain/exceptions/unsupported-branch.exception';
import { UnsupportedRatingStrategyException } from '../../policies/domain/exceptions/unsupported-rating-strategy.exception';

describe('DomainExceptionFilter', () => {
  const filter = new DomainExceptionFilter();

  const createMockResponse = () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    return { status, json };
  };

  const createMockHost = (response: any) => ({
    switchToHttp: () => ({
      getResponse: () => response,
    }),
  });

  it('should map InvalidPolicyDataException to 400', () => {
    const response = createMockResponse();
    const host = createMockHost(response);
    const exception = new InvalidPolicyDataException('bad data');

    filter.catch(exception, host as any);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        error: 'BadRequestException',
        message: 'bad data',
        timestamp: expect.any(String),
      }),
    );
  });

  it('should map InvalidStateTransitionException to 400', () => {
    const response = createMockResponse();
    const host = createMockHost(response);
    const exception = new InvalidStateTransitionException('QUOTED', 'ACTIVE');

    filter.catch(exception, host as any);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        error: 'BadRequestException',
        message: 'Invalid policy state transition from QUOTED to ACTIVE',
        timestamp: expect.any(String),
      }),
    );
  });

  it('should map UnsupportedBranchException to 400', () => {
    const response = createMockResponse();
    const host = createMockHost(response);
    const exception = new UnsupportedBranchException('MARINE');

    filter.catch(exception, host as any);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        error: 'BadRequestException',
      }),
    );
  });

  it('should map UnsupportedRatingStrategyException to 400', () => {
    const response = createMockResponse();
    const host = createMockHost(response);
    const exception = new UnsupportedRatingStrategyException('FLOOD');

    filter.catch(exception, host as any);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        error: 'BadRequestException',
      }),
    );
  });

  it('should map PolicyNotFoundException to 404', () => {
    const response = createMockResponse();
    const host = createMockHost(response);
    const exception = new PolicyNotFoundException('policy-123');

    filter.catch(exception, host as any);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        error: 'NotFoundException',
      }),
    );
  });

  it('should map CustomerNotFoundException to 404', () => {
    const response = createMockResponse();
    const host = createMockHost(response);
    const exception = new CustomerNotFoundException('customer-123');

    filter.catch(exception, host as any);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        error: 'NotFoundException',
      }),
    );
  });

  it('should map EmailAlreadyExistsException to 409', () => {
    const response = createMockResponse();
    const host = createMockHost(response);
    const exception = new EmailAlreadyExistsException('a@b.com');

    filter.catch(exception, host as any);

    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        error: 'ConflictException',
        message: expect.stringContaining('a@b.com'),
      }),
    );
  });

  it('should preserve the HttpException body (e.g. ValidationPipe errors)', () => {
    const response = createMockResponse();
    const host = createMockHost(response);
    const exception = new BadRequestException({
      statusCode: 400,
      message: ['name must be longer than or equal to 2 characters'],
      error: 'Bad Request',
    });

    filter.catch(exception, host as any);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: ['name must be longer than or equal to 2 characters'],
        error: 'Bad Request',
      }),
    );
  });

  it('should return a generic 500 JSON for unknown errors without exposing internals', () => {
    const loggerErrorSpy = jest
      .spyOn(filter['logger'], 'error')
      .mockImplementation();
    const response = createMockResponse();
    const host = createMockHost(response);
    const exception = new TypeError('cannot read property of undefined');

    filter.catch(exception, host as any);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        error: 'InternalServerError',
        message: 'Internal server error',
        timestamp: expect.any(String),
      }),
    );
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'cannot read property of undefined',
      expect.any(String),
    );

    loggerErrorSpy.mockRestore();
  });
});
