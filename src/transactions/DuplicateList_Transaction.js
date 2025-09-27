// /src/transactions/DuplicateList_Transaction.js
export default class DuplicateList_Transaction {
  constructor(app, sourceListId) {
    this.app = app;
    this.sourceListId = sourceListId; // id of the list we are copying
    this.newListId = null;            // id of the newly created list
  }

  // jsTPS will call this
  executeDo() {
    this.newListId = this.app.duplicatePlaylist(this.sourceListId);
  }

  // jsTPS will call this on undo
  executeUndo() {
    if (this.newListId != null) {
      this.app.deletePlaylistById(this.newListId);
    }
  }

  // Optional fallback for older code using doTransaction/undoTransaction
  doTransaction() {
    this.executeDo();
  }

  undoTransaction() {
    this.executeUndo();
  }
}
