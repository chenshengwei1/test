// ============================================================
// 存储后端抽象基类 - 所有存储方案必须实现此接口
// ============================================================
export class StorageBackend {
  /**
   * 上传文件
   * @param {File} file - 文件对象
   * @param {Object} options - 额外选项
   * @returns {Promise<{fileId: string, downloadUrl: string, size: number, filename: string}>}
   */
  async upload(file, options = {}) {
    throw new Error('upload() must be implemented');
  }

  /**
   * 下载文件
   * @param {string} fileId - 文件标识
   * @returns {Promise<{data: Blob, filename: string, size: number, contentType: string}>}
   */
  async download(fileId) {
    throw new Error('download() must be implemented');
  }

  /**
   * 删除文件
   * @param {string} fileId - 文件标识
   * @returns {Promise<boolean>}
   */
  async delete(fileId) {
    throw new Error('delete() must be implemented');
  }

  /**
   * 获取文件信息
   * @param {string} fileId - 文件标识
   * @returns {Promise<{filename: string, size: number, contentType: string, downloadUrl: string}>}
   */
  async getInfo(fileId) {
    throw new Error('getInfo() must be implemented');
  }

  /**
   * 获取存储后端名称
   */
  get name() {
    return 'storage';
  }
}