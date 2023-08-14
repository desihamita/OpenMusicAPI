const Joi = require('joi');

const ExportSongPlaylistPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

module.exports = ExportSongPlaylistPayloadSchema;
