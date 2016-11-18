import { ActionReducer } from '@ngrx/store';
import { CommandReducer } from 'ngrx-command-reducer';
import { LoadUserAction } from './load-user/load-user.action';
import { loadUserCommand } from './load-user/load-user.command';
import { LoadUserSuccessAction } from './load-user-success/load-user-success.action';
import { loadUserSuccessCommand } from './load-user-success/load-user-success.command';
import { loadUserErrorCommand } from './load-user-error/load-user-error.command';
import { LoadUserErrorAction } from './load-user-error/load-user-error.action';
import { AuthState } from '../../model/state/auth.state';
import { Auth } from '../../model/auth';

const DEFAULT_STATE = {
  state: AuthState.LOGGED_OUT,
  user: null,
  error: null,
};

export const authReducer: ActionReducer<Auth> = new CommandReducer<Auth>(DEFAULT_STATE)
  .add(LoadUserAction, loadUserCommand)
  .add(LoadUserSuccessAction, loadUserSuccessCommand)
  .add(LoadUserErrorAction, loadUserErrorCommand)
  .reducer();
