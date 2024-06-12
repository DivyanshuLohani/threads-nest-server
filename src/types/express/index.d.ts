// src/types/express/index.d.ts

import { IUser } from "../../models/User";
import { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    user?: IUser;
  }
}
