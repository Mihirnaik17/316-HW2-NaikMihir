// /src/transactions/EditSong_Transaction.js
import { jsTPS_Transaction } from 'jstps';

export default class EditSong_Transaction extends jsTPS_Transaction {
  constructor(app, index1Based, newFields) {
    super();
    this.app = app;
    this.index = Number(index1Based);   // 1-based index
    this.newFields = { ...newFields };  // new values to apply
    this.oldSong = null;                // store original for undo
  }

  // Called when transaction is executed
  doTransaction() {
    this.oldSong = this.app.editSong(this.index, this.newFields);
  }

  // Called when transaction is undone
  undoTransaction() {
    this.app.restoreSongFields(this.index, this.oldSong);
  }
}
