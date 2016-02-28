import {bootstrap} from 'angular2/platform/browser'
import {ROUTER_PROVIDERS} from 'angular2/router';

import {provideStore} from '@ngrx/store';
//import * as devtools from '@ngrx/devtools'

import {SoundroomComponent} from './soundroom.component'
import {playlistCollectionReducer} from "./model/reducers/playlists-collection.reducer";

//let enhanced = devtools.instrument()(createStore);

bootstrap(SoundroomComponent, [
  provideStore({playlistsCollection: playlistCollectionReducer}),
  ROUTER_PROVIDERS
])
  .catch(err => console.error(err));
