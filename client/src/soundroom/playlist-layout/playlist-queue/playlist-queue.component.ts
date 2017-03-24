import { Component, ChangeDetectionStrategy, Input, OnChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { Playlist } from '../../shared/model/playlist';
import { PlaylistTrack } from '../../shared/model/playlist-track';
import { PlaylistService } from '../../shared/service/playlist.service';
import { UpVote } from '../../shared/model/up-vote';
import { User } from '../../shared/model/user';
import { PlaylistError } from '../../shared/model/error/PlaylistError';
import { AppState } from '../../shared/model/app-state';
import { TrackUpVoteAction } from '../../shared/store/playlist-collection/track-up-vote/track-up-vote.action';

const alertify = require('alertify.js');

@Component({
  selector: 'sr-playlist-queue',
  template: require('./playlist-queue.html'),
  styles: [require('./playlist-queue.scss')],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistQueueComponent implements OnChanges {

  @Input() playlist: Playlist;
  @Input() user: User;

  /**
   * List of tracks in queue (not including first track ink playlist)
   */
  private playlistTracks: PlaylistTrack[];

  constructor(private playlistService: PlaylistService, private store$: Store<AppState>) {
  }

  ngOnChanges() {
    this.playlistTracks = this.playlist.tracks.filter((playlistTrack, index) => index > 0);
  }

  upVote(playlistTrack: PlaylistTrack): void {
    this.store$.dispatch(new TrackUpVoteAction({playlist: this.playlist, playlistTrack}));
  }

  hasUserUpVote(playlistTrack: PlaylistTrack): boolean {
    return playlistTrack.upVotes.reduce((previous: boolean, upVote: UpVote) => {
      return previous || upVote.createdBy._id === this.user._id;
    }, false);
  }

  deleteTrack(playlistTrack: PlaylistTrack) {
    // confirm dialog
    const ending = Math.random() > .5
      ? `<strong>${playlistTrack.track.artists[0].name}</strong> might be offended!`
      : `<strong>${playlistTrack.track.artists[0].name}</strong> will never speak to you again!`;
    const message = `Permanently delete <strong>'${playlistTrack.track.name}'</strong> from this playlist?
      <br><br>
      ${ending}`;

    alertify.confirm(message, () => {
      // user clicked "ok"
      this.playlistService.deleteTrack(this.playlist, playlistTrack)
        .subscribe((status: number) => {
          alertify.success(`Your track has been deleted.`);
        }, (error: PlaylistError) => {
          console.error('PlaylistQueueComponent.deleteTrack:', error);
          alertify.error(`Sorry, we weren\'t able to delete your track, please try again.`);
        });
    });
  }

  canCurrentUserDeleteTrack(playlistTrack: PlaylistTrack) {
    return this.playlistService.canUserDeleteTrack(playlistTrack, this.user);
  }
}
