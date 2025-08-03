import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  ValidationError,
} from "@nestjs/common";
import { Request, Response } from "express";
import { ApiResponse } from "@/types/api-response.interface";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Для BadRequestException и ValidationPipe ошибок, используем более точное сообщение
    let message =
      exception instanceof HttpException
        ? exception.message
        : "Internal Server Error";

    // Особая обработка для ошибок валидации
    const isValidationError = this.isValidationError(exception);
    if (isValidationError) {
      message = "Validation Failed";
    }

    const errorCode = this.getErrorCode(status, message);

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception.stack
    );

    const errorResponse: ApiResponse<null> = {
      success: false,
      error: {
        code: errorCode,
        message: message,
        details: this.getErrorDetails(exception),
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    };

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number, message: string): string {
    const baseCode = message
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");

    return `E${status}_${baseCode}`;
  }

  private getErrorDetails(exception: any): Record<string, any> | undefined {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (this.isValidationError(exception)) {
        const validationErrors = this.extractValidationErrors(exception);
        return {
          validationErrors,
          error: "Validation Failed",
          statusCode: exception.getStatus(),
        };
      }

      // Показываем, если response — объект с данными
      if (typeof response === "object" && response !== null) {
        return response as Record<string, any>;
      }

      // Иногда response — строка (например, при `throw new BadRequestException('Invalid')`)
      return {
        error: typeof response === "string" ? response : "Bad Request",
        statusCode: exception.getStatus(),
      };
    }

    // Показываем stack в dev-среде
    if (process.env.NODE_ENV !== "production") {
      return { stack: exception.stack };
    }

    return undefined;
  }
  /**
   * Проверяет, является ли ошибка ошибкой валидации от ValidationPipe
   */
  private isValidationError(exception: any): boolean {
    if (!(exception instanceof HttpException)) {
      return false;
    }

    const response = exception.getResponse() as any;
    return (
      exception.getStatus() === 400 &&
      response &&
      Array.isArray(response.message) &&
      response.message.length > 0 &&
      typeof response.message[0] === "object" &&
      response.message[0].property !== undefined
    );
  }

  /**
   * Извлекает и форматирует ошибки валидации в более читаемый формат
   */
  private extractValidationErrors(exception: any): Record<string, string[]> {
    const response = exception.getResponse() as any;
    const validationErrors = response.message;

    const formattedErrors: Record<string, string[]> = {};

    const recurse = (
      errors: ValidationError[],
      parentPath: string = ""
    ): void => {
      for (const error of errors) {
        const propertyPath = parentPath
          ? `${parentPath}.${error.property}`
          : error.property;

        if (error.constraints) {
          formattedErrors[propertyPath] = Object.values(error.constraints);
        }

        if (error.children && error.children.length) {
          recurse(error.children, propertyPath);
        }
      }
    };

    recurse(validationErrors);

    return formattedErrors;
  }

  /**
   * Рекурсивно добавляет вложенные ошибки валидации
   */
  private addNestedValidationErrors(
    children: ValidationError[],
    messages: string[],
    parentField: string
  ): void {
    children.forEach((child) => {
      const field = `${parentField}.${child.property}`;

      if (child.constraints) {
        messages.push(
          ...Object.values(child.constraints).map((msg) => `${field}: ${msg}`)
        );
      }

      if (child.children?.length) {
        this.addNestedValidationErrors(child.children, messages, field);
      }
    });
  }
}
