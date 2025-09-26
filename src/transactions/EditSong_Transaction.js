import { jsTPS_Transaction } from 'jstps';

export default class EditSong_Transaction extends jsTPS_Transaction {
  constructor(app, index1Based, newFields) {
    super();
    this.app = app;
    this.index = Number(index1Based); // 1-based
    this.newFields = { ...newFields };
    this.oldSong = null;              // captured on doTransaction
  }

  doTransaction() {
    // Apply edit; get snapshot of old song for undo
    this.oldSong = this.app.editSong(this.index, this.newFields);
  }

  undoTransaction() {
    // Restore previous snapshot
    this.app.restoreSongFields(this.index, this.oldSong);
  }
}
