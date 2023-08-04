const mapDBToModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
});

const mapPlaylist = ({
  id,
  name,
  username,
}) => ({
  id,
  name,
  username,
});

module.exports = {
  mapDBToModel,
  mapPlaylist,
};
