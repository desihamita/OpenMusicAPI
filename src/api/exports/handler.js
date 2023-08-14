const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(service, playlistsService, validator) {
    this._service = service;
    this._validator = validator;
    this._playlistsService = playlistsService;

    autoBind(this);
  }

  async postExportSongPlaylistHandler(request, h) {
    this._validator.validateSongPlaylistPayload(request.payload);
    const { playlistId } = request.params;
    const { targetEmail } = request.payload;
    const { id: owner } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, owner);

    const message = {
      userId: owner,
      playlistId,
      targetEmail,
    };
    await this._service.sendMessage('export:playlists', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
