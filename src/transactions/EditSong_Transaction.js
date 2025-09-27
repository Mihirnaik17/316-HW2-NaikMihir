// EditSong_Transaction.js
import { jsTPS_Transaction } from 'jstps';

export default class EditSong_Transaction extends jsTPS_Transaction {
  constructor(app, index1Based, newFields) {
    super();
    this.app = app;
    this.index = Number(index1Based);
    this.newFields = { ...newFields };
    this.oldSong = null;
  }

  // ✅ CORRECT METHOD NAME
  executeDo() {
    console.log("🛠 Executing EditSong_Transaction");
    this.oldSong = this.app.editSong(this.index, this.newFields);
  }

  executeUndo() {
    console.log("↩️ Undoing EditSong_Transaction");
    this.app.restoreSongFields(this.index, this.oldSong);
  }
}
