export default class DeleteSong_Transaction {
  constructor(app, oneBasedIndex) {
    this.app = app;
    this.index = Number(oneBasedIndex);
    this.removed = null;
  }

  executeDo() {
    this.removed = this.app.deleteSong(this.index);
  }

  executeUndo() {
    if (this.removed) {
      this.app.restoreSong(this.index, this.removed);
    }
  }

  doTransaction() {
    this.executeDo();
  }

  undoTransaction() {
    this.executeUndo();
  }
}
