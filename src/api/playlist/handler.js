const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(playlistsService, playlistSongsService, songsService, validator) {
    this._playlistsService = playlistsService;
    this._playlistSongsService = playlistSongsService;
    this._songsService = songsService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: owner } = request.auth.credentials;

    const result = await this._playlistsService.addPlaylist(name, owner);

    const response = h.response({
      status: 'success',
      data: {
        playlistId: result,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const result = await this._playlistsService.getPlaylistsByOwner(owner);
    return {
      status: 'success',
      data: {
        playlists: result,
      },
    };
  }

  async deletePlaylistHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: owner } = request.auth.credentials;

    await this._playlistsService.deletePlaylistById(playlistId, owner);
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongToPlaylistHandler(request, h) {
    this._validator.validatePostSongToPlaylistPayload(request.payload);
    const { id: userId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    await this._songsService.verifySongIsExist(songId);

    await this._playlistSongsService.addSongToPlaylist(
      playlistId,
      userId,
      songId,
    );

    const response = h.response({
      status: 'success',
      message: 'Berhasil menambahkan lagu',
    });
    response.code(201);
    return response;
  }

  async getSongsFromPlaylistHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    const songsFromPlaylist = await this._playlistSongsService.getSongsFromPlaylistId(
      playlistId,
      userId,
    );
    const response = h.response({
      status: 'success',
      data: {
        playlist: songsFromPlaylist,
      },
    });
    response.code(200);
    return response;
  }

  async deleteSongFromPlaylistHandler(request, h) {
    this._validator.validateDeleteSongFromPlaylistPayload(request.payload);
    const { id: userId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    await this._playlistSongsService.deleteSongFromPlaylistId(
      playlistId,
      userId,
      songId,
    );

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }

  async getPlaylistActivitiesByIdHandler(req) {
    const { id } = req.params;
    const { id: credentialId } = req.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(id, credentialId);

    const activities = await this._playlistsService.getPlaylistActivitiesById(
      id,
    );

    return {
      status: 'success',
      data: {
        playlistId: id,
        activities,
      },
    };
  }
}

module.exports = PlaylistsHandler;
