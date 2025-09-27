// /src/transactions/DuplicateSong_Transaction.js
export default class DuplicateSong_Transaction {
  constructor(app, oneBasedIndex) {
    this.app = app;
    this.index = Number(oneBasedIndex);     // 1-based index of the ORIGINAL song
    this.insertedIndex = null;              // 1-based index where the copy gets inserted
  }

  // Called by jsTPS when doing the transaction
  executeDo() {
    this.insertedIndex = this.index + 1;
    this.app.duplicateSong(this.index, this.insertedIndex);
  }

  // Called by jsTPS when undoing the transaction
  executeUndo() {
    if (this.insertedIndex != null) {
      this.app.deleteSong(this.insertedIndex);
    }
  }

  // Optional legacy support (just in case)
  doTransaction() {
    this.executeDo();
  }

  undoTransaction() {
    this.executeUndo();
  }
}
