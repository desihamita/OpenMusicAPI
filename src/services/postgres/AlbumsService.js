const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToAlbumsModel } = require('../../utils');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $4) RETURNING id',
      values: [id, name, year, createdAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Catatan gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const query = {
      text: 'SELECT id, name, year, "coverUrl" FROM albums WHERE id = $1',
      value: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
    return result.rows[0];
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT id, name, year, "coverUrl" FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
    return result.rows.map(mapDBToAlbumsModel)[0];
  }

  async getSongsInAlbum(albumId) {
    const album = await this.getAlbumById(albumId);

    const query = {
      text: `SELECT songs.id, songs.title, songs.performer
        FROM albums
        INNER JOIN songs ON songs.album_id = albums.id
        WHERE albums.id = $1`,
      values: [albumId],
    };

    const result = await this._pool.query(query);

    return { ...album, songs: result.rows };
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3  WHERE id = $4 RETURNING id ',
      values: [name, year, updatedAt, id],
    };
    const resultAlbum = await this._pool.query(query);
    if (!resultAlbum.rows.length) {
      throw new NotFoundError('Gagal Memperbarui album');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
