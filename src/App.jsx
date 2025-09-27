import React from 'react';
import './App.css';
import DeleteSong_Transaction from './transactions/DeleteSong_Transaction.js';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import { jsTPS } from 'jstps';

// OUR TRANSACTIONS
import MoveSong_Transaction from './transactions/MoveSong_Transaction.js';
import EditSong_Transaction from './transactions/EditSong_Transaction.js';
import DuplicateSong_Transaction from './transactions/DuplicateSong_Transaction.js';
import DuplicateList_Transaction from './transactions/DuplicateList_Transaction.js';

// THESE REACT COMPONENTS ARE MODALS
import DeleteListModal from './components/DeleteListModal.jsx';
import EditSongModal from './components/EditSongModal.jsx';

// THESE REACT COMPONENTS ARE IN OUR UI
import Banner from './components/Banner.jsx';
import EditToolbar from './components/EditToolbar.jsx';
import SidebarHeading from './components/SidebarHeading.jsx';
import SidebarList from './components/PlaylistCards.jsx';
import SongCards from './components/SongCards.jsx';
import Statusbar from './components/Statusbar.jsx';
import AddSong_Transaction from './transactions/AddSong_Transaction';


class App extends React.Component {
  constructor(props) {
    super(props);

    // THIS IS OUR TRANSACTION PROCESSING SYSTEM
    this.tps = new jsTPS();

    // THIS WILL TALK TO LOCAL STORAGE
    this.db = new DBManager();

    // GET THE SESSION DATA FROM OUR DATA MANAGER
    let loadedSessionData = this.db.queryGetSessionData();
    
    // SETUP THE INITIAL STATE
    this.state = {
      listKeyPairMarkedForDeletion: null,
      currentList: null,
      sessionData: loadedSessionData,
      editSongIndex: null,
    };
  }

  sortKeyNamePairsByName = (keyNamePairs) => {
    keyNamePairs.sort((keyPair1, keyPair2) => {
      return keyPair1.name.localeCompare(keyPair2.name);
    });
  };

  // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
  createNewList = () => {
    let newKey = this.state.sessionData.nextKey;
    let newName = 'Untitled' + newKey;

    let newList = {
      key: newKey,
      name: newName,
      songs: [],
    };

    let newKeyNamePair = { key: newKey, name: newName };
    let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
    this.sortKeyNamePairsByName(updatedPairs);

    this.setState(
      (prevState) => ({
        listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
        currentList: newList,
        sessionData: {
          nextKey: prevState.sessionData.nextKey + 1,
          counter: prevState.sessionData.counter + 1,
          keyNamePairs: updatedPairs,
        },
      }),
      () => {
        this.db.mutationCreateList(newList);
        this.db.mutationUpdateSessionData(this.state.sessionData);
      }
    );
  };

  // THIS FUNCTION BEGINS THE PROCESS OF DELETING A LIST.
  deleteList = (key) => {
    let newCurrentList = null;
    if (this.state.currentList) {
      if (this.state.currentList.key !== key) {
        newCurrentList = this.state.currentList;
      }
    }

    let keyIndex = this.state.sessionData.keyNamePairs.findIndex(
      (keyNamePair) => keyNamePair.key === key
    );
    let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
    if (keyIndex >= 0) newKeyNamePairs.splice(keyIndex, 1);

    this.setState(
      (prevState) => ({
        listKeyPairMarkedForDeletion: null,
        currentList: newCurrentList,
        sessionData: {
          nextKey: prevState.sessionData.nextKey,
          counter: prevState.sessionData.counter - 1,
          keyNamePairs: newKeyNamePairs,
        },
      }),
      () => {
        this.db.mutationDeleteList(key);
        this.db.mutationUpdateSessionData(this.state.sessionData);
      }
    );
  };

  deleteMarkedList = () => {
    this.deleteList(this.state.listKeyPairMarkedForDeletion.key);
    this.hideDeleteListModal();
  };

  // THIS FUNCTION SPECIFICALLY DELETES THE CURRENT LIST
  deleteCurrentList = () => {
    if (this.state.currentList) {
      this.deleteList(this.state.currentList.key);
    }
  };

  renameList = (key, newName) => {
    let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
    for (let i = 0; i < newKeyNamePairs.length; i++) {
      let pair = newKeyNamePairs[i];
      if (pair.key === key) {
        pair.name = newName;
      }
    }
    this.sortKeyNamePairsByName(newKeyNamePairs);

    let currentList = this.state.currentList;
    if (currentList && currentList.key === key) {
      currentList.name = newName;
    }

    this.setState(
      (prevState) => ({
        listKeyPairMarkedForDeletion: null,
        sessionData: {
          nextKey: prevState.sessionData.nextKey,
          counter: prevState.sessionData.counter,
          keyNamePairs: newKeyNamePairs,
        },
      }),
      () => {
        let list = this.db.queryGetList(key);
        list.name = newName;
        this.db.mutationUpdateList(list);
        this.db.mutationUpdateSessionData(this.state.sessionData);
      }
    );
  };

  // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
  loadList = (key) => {
    let newCurrentList = this.db.queryGetList(key);
    this.setState(
      (prevState) => ({
        listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
        currentList: newCurrentList,
        sessionData: this.state.sessionData,
      }),
      () => {
        this.tps.clearAllTransactions();
      }
    );
  };

  // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
  closeCurrentList = () => {
    this.setState(
      (prevState) => ({
        listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
        currentList: null,
        sessionData: this.state.sessionData,
      }),
      () => {
        this.tps.clearAllTransactions();
      }
    );
  };

  setStateWithUpdatedList(list) {
    this.setState(
      (prevState) => ({
        listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
        currentList: list,
        sessionData: this.state.sessionData,
      }),
      () => {
        this.db.mutationUpdateList(this.state.currentList);
      }
    );
  }

  getPlaylistSize = () => {
    return this.state.currentList.songs.length;
  };

  // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST
  moveSong(start, end) {
    const list = this.state.currentList;
    const s = Number(start) - 1;
    const e = Number(end) - 1;
    if (s === e) return;

    const newSongs = [...list.songs];
    const [moved] = newSongs.splice(s, 1);
    newSongs.splice(e, 0, moved);

    const newList = { ...list, songs: newSongs };
    this.setStateWithUpdatedList(newList);
  }

  // THIS FUNCTION ADDS A MoveSong_Transaction
  addMoveSongTransaction = (start, end) => {
    let transaction = new MoveSong_Transaction(this, start, end);
    this.tps.processTransaction(transaction);
  };

  // Apply the edit and return a snapshot of the old song (for undo)
  editSong = (index, newFields) => {
    const i = Number(index) - 1;
    const { currentList } = this.state;
    const oldSong = { ...currentList.songs[i] };

    const updatedSong = { ...oldSong, ...newFields };
    const newSongs = currentList.songs.map((s, idx) => (idx === i ? updatedSong : s));
    const newList = { ...currentList, songs: newSongs };

    this.setStateWithUpdatedList(newList);
    return oldSong;
  };

  // Restore the previous snapshot (used by undo)
  restoreSongFields = (oneBasedIndex, oldSong) => {
    const i = Number(oneBasedIndex) - 1;
    const { currentList } = this.state;
    if (!currentList || !oldSong) return;

    const newSongs = currentList.songs.map((s, idx) => (idx === i ? oldSong : s));
    const newList = { ...currentList, songs: newSongs };

    this.setStateWithUpdatedList(newList);
  };

  // Create + process the transaction, then close the modal
  addEditSongTransaction = (oneBasedIndex, fields) => {
    const t = new EditSong_Transaction(this, oneBasedIndex, fields);
    this.tps.processTransaction(t);
    this.closeEditSongModal();
  };

  // UNDO/REDO
  undo = () => {
    if (this.tps.hasTransactionToUndo()) {
      this.tps.undoTransaction();
      this.db.mutationUpdateList(this.state.currentList);
    }
  };
  redo = () => {
    if (this.tps.hasTransactionToDo()) {
      this.tps.doTransaction();
      this.db.mutationUpdateList(this.state.currentList);
    }
  };

  markListForDeletion = (keyPair) => {
    this.setState(
      (prevState) => ({
        currentList: prevState.currentList,
        listKeyPairMarkedForDeletion: keyPair,
        sessionData: prevState.sessionData,
      }),
      () => {
        this.showDeleteListModal();
      }
    );
  };

  // Delete by 1-based index; return the removed song for undo
  deleteSong = (oneBasedIndex) => {
    const idx = Number(oneBasedIndex) - 1;
    const { currentList } = this.state;
    if (!currentList || idx < 0 || idx >= currentList.songs.length) return null;

    const removed = currentList.songs[idx];
    const newSongs = [
      ...currentList.songs.slice(0, idx),
      ...currentList.songs.slice(idx + 1),
    ];
    const newList = { ...currentList, songs: newSongs };
    this.setStateWithUpdatedList(newList);
    console.log("🔥 Actually deleting song at index:", oneBasedIndex);

    return removed;
  };

  // Restore song at 1-based index (for undo)
  restoreSong = (oneBasedIndex, song) => {
    const idx = Number(oneBasedIndex) - 1;
    const { currentList } = this.state;
    if (!currentList || !song) return;

    const newSongs = [
      ...currentList.songs.slice(0, idx),
      song,
      ...currentList.songs.slice(idx),
    ];
    const newList = { ...currentList, songs: newSongs };
    this.setStateWithUpdatedList(newList);
  };

  // Transaction wrapper
  addDeleteSongTransaction = (oneBasedIndex) => {
    const t = new DeleteSong_Transaction(this, oneBasedIndex);
    console.log("📦 Creating DeleteSong_Transaction for index:", oneBasedIndex);

    this.tps.processTransaction(t);
  };

  addAddSongTransaction = () => {
  const t = new AddSong_Transaction(this);
  this.tps.processTransaction(t);
};


  // --- DUPLICATE SONG (deep copy) + TRANSACTION ---
  duplicateSong = (sourceOneBasedIndex, insertOneBasedIndex) => {
    const src = Number(sourceOneBasedIndex) - 1;
    const ins = Number(insertOneBasedIndex) - 1;

    const { currentList } = this.state;
    if (!currentList || src < 0 || src >= currentList.songs.length) return;

    const copy = { ...currentList.songs[src] }; // fields are primitives; shallow spread is a deep copy here
    const newSongs = [
      ...currentList.songs.slice(0, ins),
      copy,
      ...currentList.songs.slice(ins),
    ];
    const newList = { ...currentList, songs: newSongs };
    this.setStateWithUpdatedList(newList);
  };

  addNewSong = () => {
  const { currentList } = this.state;
  if (!currentList) return null;

  const defaultSong = {
    title: "Untitled",
    artist: "Unknown",
    youTubeId: "dQw4w9WgXcQ"
  };

  const newSongs = [...currentList.songs, defaultSong];
  const newList = { ...currentList, songs: newSongs };
  this.setStateWithUpdatedList(newList);

  // Return 1-based index for the transaction to undo
  return newSongs.length;
};


  addDuplicateSongTransaction = (oneBasedIndex) => {
    const t = new DuplicateSong_Transaction(this, oneBasedIndex);
    this.tps.processTransaction(t);
  };

  // --- DUPLICATE PLAYLIST (deep copy) + TRANSACTION HELPERS ---
  duplicatePlaylist = (sourceKey) => {
    const { sessionData } = this.state;
    const list = this.db.queryGetList(sourceKey);
    if (!list) return null;

    const newKey = sessionData.nextKey;
    const newName = list.name + ' (Copy)';

    // deep copy songs
    const songsCopy = list.songs.map(s => ({ ...s }));

    const newList = {
      key: newKey,
      name: newName,
      songs: songsCopy,
    };

    // update keyNamePairs
    const newKeyNamePairs = [...sessionData.keyNamePairs, { key: newKey, name: newName }];
    this.sortKeyNamePairsByName(newKeyNamePairs);

    const newSessionData = {
      nextKey: sessionData.nextKey + 1,
      counter: sessionData.counter + 1,
      keyNamePairs: newKeyNamePairs,
    };

    this.setState(
      (prev) => ({
        ...prev,
        sessionData: newSessionData
      }),
      () => {
        this.db.mutationCreateList(newList);
        this.db.mutationUpdateSessionData(this.state.sessionData);
      }
    );

    return newKey;
  };

  deletePlaylistById = (key) => {
    // helper used by undo of duplicate playlist
    let newCurrentList = null;
    if (this.state.currentList) {
      if (this.state.currentList.key !== key) {
        newCurrentList = this.state.currentList;
      }
    }

    let keyIndex = this.state.sessionData.keyNamePairs.findIndex(
      (keyNamePair) => keyNamePair.key === key
    );
    let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
    if (keyIndex >= 0) newKeyNamePairs.splice(keyIndex, 1);

    this.setState(
      (prevState) => ({
        listKeyPairMarkedForDeletion: null,
        currentList: newCurrentList,
        sessionData: {
          nextKey: prevState.sessionData.nextKey,
          counter: prevState.sessionData.counter - 1,
          keyNamePairs: newKeyNamePairs,
        },
      }),
      () => {
        this.db.mutationDeleteList(key);
        this.db.mutationUpdateSessionData(this.state.sessionData);
      }
    );
  };

  addDuplicatePlaylistTransaction = (sourceKey) => {
    const t = new DuplicateList_Transaction(this, sourceKey);
    this.tps.processTransaction(t);
  };

  // MODAL SHOW/HIDE
  showDeleteListModal() {
    let modal = document.getElementById('delete-list-modal');
    modal.classList.add('is-visible');
  }
  hideDeleteListModal() {
    let modal = document.getElementById('delete-list-modal');
    modal.classList.remove('is-visible');
  }
  openEditSongModal = (oneBasedIndex) => {
    this.setState({ editSongIndex: Number(oneBasedIndex) }, () => {
      const modal = document.getElementById('edit-song-modal');
      if (modal) modal.classList.add('is-visible');
    });
  };

  closeEditSongModal = () => {
    const modal = document.getElementById('edit-song-modal');
    if (modal) modal.classList.remove('is-visible');
    this.setState({ editSongIndex: null });
  };

  render() {
    let canAddSong = this.state.currentList !== null;
    let canUndo = this.tps.hasTransactionToUndo();
    let canRedo = this.tps.hasTransactionToDo();
    let canClose = this.state.currentList !== null;

    return (
      <div id="app">
        <Banner />
        <SidebarHeading createNewListCallback={this.createNewList} />
        <SidebarList
          currentList={this.state.currentList}
          keyNamePairs={this.state.sessionData.keyNamePairs}
          deleteListCallback={this.markListForDeletion}
          loadListCallback={this.loadList}
          renameListCallback={this.renameList}
          duplicateListCallback={this.addDuplicatePlaylistTransaction}
        />
        <EditToolbar
          canAddSong={canAddSong}
          canUndo={canUndo}
          canRedo={canRedo}
          canClose={canClose}
          undoCallback={this.undo}
          redoCallback={this.redo}
          closeCallback={this.closeCurrentList}
          addSongCallback={this.addAddSongTransaction}
        />
        <SongCards
          currentList={this.state.currentList}
          moveSongCallback={this.addMoveSongTransaction}
          deleteSongCallback={this.addDeleteSongTransaction}
          openEditSongCallback={this.openEditSongModal}
          duplicateSongCallback={this.addDuplicateSongTransaction}
        />
        <Statusbar currentList={this.state.currentList} />
        <DeleteListModal
          listKeyPair={this.state.listKeyPairMarkedForDeletion}
          hideDeleteListModalCallback={this.hideDeleteListModal}
          deleteListCallback={this.deleteMarkedList}
        />
        <EditSongModal
          song={
            this.state.editSongIndex
              ? this.state.currentList?.songs[this.state.editSongIndex - 1]
              : null
          }
          onConfirm={(fields) =>
            this.addEditSongTransaction(this.state.editSongIndex, fields)
          }
          onCancel={this.closeEditSongModal}
        />
      </div>
    );
  }
}

export default App;
