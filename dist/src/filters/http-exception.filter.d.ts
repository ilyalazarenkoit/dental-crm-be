import { ExceptionFilter, ArgumentsHost } from "@nestjs/common";
export declare class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: any, host: ArgumentsHost): void;
    private getErrorCode;
    private getErrorDetails;
    private isValidationError;
    private extractValidationErrors;
    private addNestedValidationErrors;
}
