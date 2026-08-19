import { StorageBackend } from './storage-interface.js';

export class LocalStorage extends StorageBackend {
  constructor() {
    super();
    this.dbName = 'FileTransitDB';
    this.storeName = 'files';
    this.db = null;
  }

  get name() {
    return '本地存储 (IndexedDB)';
  }

  async _initDB() {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async upload(file, options = {}) {
    const db = await this._initDB();
    const id = options.fileId || this._generateId();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const record = {
        id: id,
        filename: file.name,
        size: file.size,
        contentType: file.type || 'application/octet-stream',
        data: file,
        uploadedAt: Date.now()
      };
      
      const request = store.put(record);
      request.onsuccess = () => {
        resolve({
          fileId: id,
          downloadUrl: `local://${id}`,
          size: file.size,
          filename: file.name
        });
      };
      request.onerror = () => reject(request.error);
    });
  }

  async download(fileId) {
    const db = await this._initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(fileId);
      request.onsuccess = () => {
        const record = request.result;
        if (!record) {
          resolve(null);
          return;
        }
        resolve({
          data: record.data,
          filename: record.filename,
          size: record.size,
          contentType: record.contentType
        });
      };
      request.onerror = () => reject(request.error);
    });
  }

  async delete(fileId) {
    const db = await this._initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(fileId);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async getInfo(fileId) {
    const db = await this._initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(fileId);
      request.onsuccess = () => {
        const record = request.result;
        if (!record) {
          resolve(null);
          return;
        }
        resolve({
          filename: record.filename,
          size: record.size,
          contentType: record.contentType,
          downloadUrl: `local://${fileId}`
        });
      };
      request.onerror = () => reject(request.error);
    });
  }

  _generateId() {
    return Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
  }
}