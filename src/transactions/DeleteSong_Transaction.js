import { jsTPS_Transaction } from 'jstps';

export default class DeleteSong_Transaction extends jsTPS_Transaction {
  constructor(app, index) {
    super();
    this.app = app;            // App instance
    this.index = Number(index); // 1-based from UI
    this.removedSong = null;   // will capture {title, artist, ...}
  }
  doTransaction() {
    this.removedSong = this.app.deleteSong(this.index); // returns removed song object
  }
  undoTransaction() {
    this.app.restoreSong(this.index, this.removedSong);
  }
}
