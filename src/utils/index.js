const mapDBToAlbumsModel = ({
  id,
  name,
  year,
  coverUrl,
}) => ({
  id,
  name,
  year,
  coverUrl,
});

const mapDBToSongsModel = ({
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

const mapActivity = ({
  username,
  title,
  action,
  time,
}) => ({
  username,
  title,
  action,
  time,
});

module.exports = {
  mapDBToSongsModel,
  mapPlaylist,
  mapActivity,
  mapDBToAlbumsModel,
};
