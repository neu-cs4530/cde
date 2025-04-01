class FileManager {
  private _files: Map<string, string> = new Map();

  getFileContent(fileID: string): string {
    return this._files.get(fileID) ?? '';
  }

  applyEdit(fileID: string, delta: string): string {
    // TODO: For now, overwrite with full content.
    this._files.set(fileID, delta);
    return delta;
  }
}

export default new FileManager();
