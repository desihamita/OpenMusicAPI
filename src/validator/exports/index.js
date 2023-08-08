const ExportPlaylistsPayloadSchema = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const ExportsValidator = {
  validateExportPlaylistsPayload: (payload) => {
    const vaidationResult = ExportPlaylistsPayloadSchema.validate(payload);

    if (vaidationResult.error) {
      throw new InvariantError(vaidationResult.error.message);
    }
  },
};

module.exports = ExportsValidator;
