export default class DeleteSong_Transaction {
  constructor(app, oneBasedIndex) {
    this.app = app;
    this.index = Number(oneBasedIndex);
    this.removed = null;
  }

  // jsTPS expects these methods:
  executeDo() {
    this.removed = this.app.deleteSong(this.index);
  }

  executeUndo() {
    if (this.removed) {
      this.app.restoreSong(this.index, this.removed);
    }
  }

  // Optional legacy support (if jsTPS uses these too)
  doTransaction() {
    this.executeDo();
  }

  undoTransaction() {
    this.executeUndo();
  }
}
