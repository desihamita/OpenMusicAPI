const autoBind = require('auto-bind');
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongsService {
  constructor(playlistsService) {
    this._pool = new Pool();
    this._playlistsService = playlistsService;

    autoBind(this);
  }

  async addSongToPlaylist(playlistId, userId, songId) {
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    const id = `songsplaylist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal menambahkan lagu ke dalam playlist');
    }
  }

  async getSongsFromPlaylistId(playlistId, userId) {
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    const playlists = await this._playlistsService.getPlaylistById(
      userId,
      playlistId,
    );
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer
        FROM playlists
        INNER JOIN playlistsongs ON playlistsongs.playlist_id = playlists.id
        INNER JOIN songs ON songs.id = playlistsongs.song_id
        WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Gagal mengambil lagu dari playlist');
    }

    return { ...playlists, songs: result.rows };
  }

  async deleteSongFromPlaylistId(playlistId, userId, songId) {
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError(
        'Gagal menghapus lagu dari playlist. Id tidak ditemukan',
      );
    }
  }

  async addSongActivities({
    playlistId, songId, userId, action,
  }) {
    const id = `psa-${nanoid(16)}`;
    const timeStamp = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, timeStamp],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Aktifiktas lagu gagal dibuat');
    }
  }

  async getSongActivities(playlistId) {
    const query = {
      text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time FROM playlist_song_activities
        LEFT JOIN playlists ON playlist_song_activities.playlist_id = playlists.id
        LEFT JOIN songs ON playlist_song_activities.song_id = songs.id
        LEFT JOIN users ON playlist_song_activities.user_id = users.id
        WHERE playlists.id = $1`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows.map(mapActivity);
  }
}

module.exports = PlaylistSongsService;
