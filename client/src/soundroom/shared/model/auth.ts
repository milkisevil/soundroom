import { AuthState } from "./state/auth.state.ts";
import { User } from "./user";
import { ErrorResult } from "./error/error-result";

export interface Auth {

  state: AuthState;
  user: User;
  jwt: string;
  error: ErrorResult;

}
