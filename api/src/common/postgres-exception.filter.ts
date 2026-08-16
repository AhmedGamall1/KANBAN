import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { DatabaseError } from 'pg';

@Catch(DatabaseError)
export class PostgresExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(PostgresExceptionFilter.name);

    catch(error: DatabaseError, host: ArgumentsHost): void {
        const response = host.switchToHttp().getResponse<Response>();

        if (error.code === '22P02') {
            response.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Malformed identifier',
            });
            return;
        }

        this.logger.error(
            `Unhandled postgres error ${error.code}: ${error.message}`,
        );

        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Internal server error',
        });
    }
}