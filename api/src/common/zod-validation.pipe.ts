import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { z } from 'zod';

@Injectable()
export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: z.ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const { formErrors, fieldErrors } = z.flattenError(result.error);
      throw new BadRequestException({ formErrors, fieldErrors });
    }

    return result.data;
  }
}
