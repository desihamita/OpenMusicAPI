const fs = require('fs');
const { Pool } = require('pg');
const NotFoundError = require('../../exceptions/NotFoundError');

class StorageService {
  constructor(folder, cacheService) {
    this._folder = folder;
    this._pool = new Pool();
    this._cacheService = cacheService;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  writeFile(file, meta) {
    const filename = +new Date() + meta.filename;
    const path = `${this._folder}/${filename}`;

    const fileStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error));
      file.pipe(fileStream);
      file.on('end', () => resolve(filename));
    });
  }

  async addAlbumCover(filename, albumId) {
    const query = {
      text: 'UPDATE albums SET "coverUrl" = $1 WHERE id = $2',
      values: [filename, albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui Sampul. Id tidak ditemukan');
    }
  }
}

module.exports = StorageService;
