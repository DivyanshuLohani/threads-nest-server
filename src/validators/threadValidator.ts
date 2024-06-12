import { Types } from "mongoose";
import { z } from "zod";

export const ThreadSchema = z.object({
  content: z.string(),
  //   images: z.array(z.string()).optional(),
});
