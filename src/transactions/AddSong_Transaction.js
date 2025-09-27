// /src/transactions/AddSong_Transaction.js
export default class AddSong_Transaction {
  constructor(app) {
    this.app = app;
    this.index = null;  // Will be set when added
  }

  executeDo() {
    this.index = this.app.addNewSong(); // App returns index
  }

  executeUndo() {
    if (this.index !== null) {
      this.app.deleteSong(this.index);
    }
  }

  // Optional legacy names
  doTransaction() {
    this.executeDo();
  }

  undoTransaction() {
    this.executeUndo();
  }
}
