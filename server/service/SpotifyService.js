import _ from 'lodash';
import {EventEmitter} from 'events';
import getJSON from '../util/getJSON';
import nodeSpotify from 'node-spotify';
import Q from 'q';
import playbackState from '../model/state/PlaybackState';

const {SPOTIFY_APP_KEY, SPOTIFY_USERNAME, SPOTIFY_PASSWORD} = process.env;
const webAPI = 'https://api.spotify.com/v1';
const spotify = nodeSpotify({appkeyFile: SPOTIFY_APP_KEY});
const spotifyService = Object.create(EventEmitter.prototype);
const emit = spotifyService.emit.bind(spotifyService);

let progressTimeout = null;


const login = () => {

  console.log('SpotifyService.login() isConnected =', playbackState.isConnected);

  if (playbackState.isConnected) {
    return Q.when();
  }

  const deferred = Q.defer();

  const ready = (err) => {
    if (err) {
      console.error(`Login failed for ${SPOTIFY_USERNAME}:`, err);
      deferred.reject(err);
    }

    const {sessionUser} = spotify;

    const {displayName, link} = sessionUser;
    console.log(`SpotifyService.login: Success! Logged in as: ${displayName}, (${link})`);

    playbackState.isConnected = true;

    deferred.resolve(sessionUser);
  };

  spotify.on({ready});
  spotify.login(SPOTIFY_USERNAME, SPOTIFY_PASSWORD, false, false);

  return deferred.promise;
};

const getTrack = (id) => spotify.createFromLink(id);

const endOfTrack = () => spotifyService.emit('end');

const pause = () => {
  clearTimeout(progressTimeout);
  spotify.player.pause();
};

const resume = () => {
  spotify.player.resume();

  // Start progress shortly after, so that any play/resume events have dispatched first
  startProgressInterval(50);
};

const seek = (second) => spotify.player.seek(second);

const getCurrentTime = () => spotify.player.currentSecond || 0;

const getDuration = () => {
  const {currentPlaylistTrack} = playbackState;
  return (currentPlaylistTrack && currentPlaylistTrack.track.duration) || 1;
};

const getProgress = () => getCurrentTime() / getDuration();

const onProgress = () => {
  clearTimeout(progressTimeout);

  const currentTime = getCurrentTime();
  const progress = getProgress();
  const duration = getDuration();

  emit('progress', {currentTime, duration, progress});

  if (progress < 1) {
    startProgressInterval();
  }
};

const startProgressInterval = (ms) => {
  progressTimeout = setTimeout(() => onProgress(), _.isUndefined(ms) ? 900 : ms);
};

const play = (id) => {
  spotify.player.on({endOfTrack});
  spotify.player.play(getTrack(id));

  if (process.env.SKIP_TRACKS === 'true') {
    setTimeout(() => seek(getDuration() - 20), 1000);
  }

  // Start progress shortly after, so that any play/resume events have dispatched first
  startProgressInterval(50);
};

const search = (terms = '') => {
  terms = encodeURIComponent(terms);
  return getJSON(`${webAPI}/search?type=track&q=${terms}`);
};

/**
 * Returns a promise that will be resolved with an array of image data objects (ie. `[{width, height, url}]`).
 *
 * @param spotifyTrackUri
 * @returns {*}
 */
const getImageData = (spotifyTrackUri) => {
  const trackId = spotifyTrackUri.split(':').pop();
  const url = `${webAPI}/tracks/${trackId}`;
  const deferred = Q.defer();

  getJSON(url)
    .then((json) => deferred.resolve(json.album.images))
    .catch((err) => deferred.reject(err));

  return deferred.promise;
};

export default _.assign(spotifyService, {
  login,
  getImageData,
  getTrack,
  play,
  pause,
  resume,
  search
});
