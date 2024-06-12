import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export default function validate(schema: z.ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const extractedErrors: { [key: string]: string }[] = [];
        error.errors.map((err) =>
          extractedErrors.push({ [err.path[0]]: err.message })
        );
        return res.status(422).json({
          errors: extractedErrors,
        });
      }
      next(error);
    }
  };
}
