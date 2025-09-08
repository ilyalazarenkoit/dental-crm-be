"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(HttpExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = "Internal Server Error";
        if (exception instanceof common_1.HttpException) {
            const exceptionResponse = exception.getResponse();
            this.logger.debug(`Exception response type: ${typeof exceptionResponse}`);
            this.logger.debug(`Exception response: ${JSON.stringify(exceptionResponse)}`);
            this.logger.debug(`Exception message: ${exception.message}`);
            if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
                if ("message" in exceptionResponse &&
                    typeof exceptionResponse.message === "string") {
                    message = exceptionResponse.message;
                }
                else {
                    message = exception.message;
                }
            }
            else if (typeof exceptionResponse === "string") {
                message = exceptionResponse;
            }
            else {
                message = exception.message;
            }
        }
        this.logger.debug(`Final message: ${message}`);
        const isValidationError = this.isValidationError(exception);
        if (isValidationError) {
            message = "Validation Failed";
        }
        const errorCode = this.getErrorCode(status, message);
        this.logger.error(`${request.method} ${request.url} - ${status} - ${message}`, exception.stack);
        const errorResponse = {
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
    getErrorCode(status, message) {
        const baseCode = message
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, "_")
            .replace(/_+/g, "_")
            .replace(/^_|_$/g, "");
        return `E${status}_${baseCode}`;
    }
    getErrorDetails(exception) {
        if (exception instanceof common_1.HttpException) {
            const response = exception.getResponse();
            if (this.isValidationError(exception)) {
                const validationErrors = this.extractValidationErrors(exception);
                return {
                    validationErrors,
                    error: "Validation Failed",
                    statusCode: exception.getStatus(),
                };
            }
            if (typeof response === "object" && response !== null) {
                return response;
            }
            return {
                error: typeof response === "string" ? response : "Bad Request",
                statusCode: exception.getStatus(),
            };
        }
        if (process.env.NODE_ENV !== "production") {
            return { stack: exception.stack };
        }
        return undefined;
    }
    isValidationError(exception) {
        if (!(exception instanceof common_1.HttpException)) {
            return false;
        }
        const response = exception.getResponse();
        return (exception.getStatus() === 400 &&
            response &&
            Array.isArray(response.message) &&
            response.message.length > 0 &&
            typeof response.message[0] === "object" &&
            response.message[0].property !== undefined);
    }
    extractValidationErrors(exception) {
        const response = exception.getResponse();
        const validationErrors = response.message;
        const formattedErrors = {};
        const recurse = (errors, parentPath = "") => {
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
    addNestedValidationErrors(children, messages, parentField) {
        children.forEach((child) => {
            const field = `${parentField}.${child.property}`;
            if (child.constraints) {
                messages.push(...Object.values(child.constraints).map((msg) => `${field}: ${msg}`));
            }
            if (child.children?.length) {
                this.addNestedValidationErrors(child.children, messages, field);
            }
        });
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map