import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { CustomerNotFoundException } from '../../customers/domain/exceptions/customer-not-found.exception';
import { EmailAlreadyExistsException } from '../../customers/domain/exceptions/email-already-exists.exception';
import { InvalidPolicyDataException } from '../../policies/domain/exceptions/invalid-policy-data.exception';
import { InvalidStateTransitionException } from '../../policies/domain/exceptions/invalid-state-transition.exception';
import { PolicyNotFoundException } from '../../policies/domain/exceptions/policy-not-found.exception';
import { UnsupportedBranchException } from '../../policies/domain/exceptions/unsupported-branch.exception';
import { UnsupportedRatingStrategyException } from '../../policies/domain/exceptions/unsupported-rating-strategy.exception';

@Catch(Error)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const httpException = this.mapToHttpException(exception);

    response.status(httpException.getStatus()).json({
      statusCode: httpException.getStatus(),
      error: httpException.name,
      message: httpException.message,
      timestamp: new Date().toISOString(),
    });
  }

  private mapToHttpException(exception: Error) {
    if (
      exception instanceof InvalidPolicyDataException ||
      exception instanceof InvalidStateTransitionException ||
      exception instanceof UnsupportedBranchException ||
      exception instanceof UnsupportedRatingStrategyException
    ) {
      return new BadRequestException(exception.message);
    }

    if (
      exception instanceof PolicyNotFoundException ||
      exception instanceof CustomerNotFoundException
    ) {
      return new NotFoundException(exception.message);
    }

    if (exception instanceof EmailAlreadyExistsException) {
      return new ConflictException(exception.message);
    }

    throw exception;
  }
}
