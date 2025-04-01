class FileManager {
    private files: Map<string, string> = new Map();
  
    getFileContent(fileID: string): string {
      return this.files.get(fileID) ?? ''; // Default to empty string
    }
  
    applyEdit(fileID: string, delta: string): string {
      const updatedContent = delta; // TODO: Replace with merge logic
      this.files.set(fileID, updatedContent);
      return updatedContent;
    }
  }
  
  export default new FileManager();
  