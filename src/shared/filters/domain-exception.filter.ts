import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
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

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Excepciones HTTP de Nest (ValidationPipe, ParseUUIDPipe, etc.):
    // se respeta su cuerpo JSON estándar para no perder los mensajes de validación.
    if (exception instanceof HttpException) {
      const body = exception.getResponse();

      response.status(exception.getStatus()).json(
        typeof body === 'string'
          ? {
              statusCode: exception.getStatus(),
              message: body,
              timestamp: new Date().toISOString(),
            }
          : body,
      );
      return;
    }

    const httpException = this.mapToHttpException(exception);

    if (httpException) {
      response.status(httpException.getStatus()).json({
        statusCode: httpException.getStatus(),
        error: httpException.name,
        message: httpException.message,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Error inesperado: se registra internamente y se responde un 500 genérico
    // sin exponer stack traces ni detalles internos al cliente.
    this.logger.error(
      exception instanceof Error ? exception.message : String(exception),
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'InternalServerError',
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }

  private mapToHttpException(exception: unknown): HttpException | null {
    if (!(exception instanceof Error)) {
      return null;
    }

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

    return null;
  }
}
