import React from 'react';
import './App.css';
import DeleteSong_Transaction from './transactions/DeleteSong_Transaction.js';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import { jsTPS } from 'jstps';

// OUR TRANSACTIONS
import MoveSong_Transaction from './transactions/MoveSong_Transaction.js';

// THESE REACT COMPONENTS ARE MODALS
import DeleteListModal from './components/DeleteListModal.jsx';

// THESE REACT COMPONENTS ARE IN OUR UI
import Banner from './components/Banner.jsx';
import EditToolbar from './components/EditToolbar.jsx';
import SidebarHeading from './components/SidebarHeading.jsx';
import SidebarList from './components/PlaylistCards.jsx';
import SongCards from './components/SongCards.jsx';
import Statusbar from './components/Statusbar.jsx';

import EditSongModal from './components/EditSongModal.jsx';
import EditSong_Transaction from './transactions/EditSong_Transaction.js';

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
    let list = this.state.currentList;

    start -= 1;
    end -= 1;
    if (start < end) {
      let temp = list.songs[start];
      for (let i = start; i < end; i++) {
        list.songs[i] = list.songs[i + 1];
      }
      list.songs[end] = temp;
    } else if (start > end) {
      let temp = list.songs[start];
      for (let i = start; i > end; i--) {
        list.songs[i] = list.songs[i - 1];
      }
      list.songs[end] = temp;
    }
    this.setStateWithUpdatedList(list);
  }

  // THIS FUNCTION ADDS A MoveSong_Transaction
  addMoveSongTransaction = (start, end) => {
    let transaction = new MoveSong_Transaction(this, start, end);
    this.tps.processTransaction(transaction);
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
    const list = this.state.currentList;
    if (!list || idx < 0 || idx >= list.songs.length) return null;
    const [removed] = list.songs.splice(idx, 1);
    this.setStateWithUpdatedList(list);
    return removed;
  };

  // Restore song at 1-based index (for undo)
  restoreSong = (oneBasedIndex, song) => {
    const idx = Number(oneBasedIndex) - 1;
    const list = this.state.currentList;
    if (!list || !song) return;
    list.songs.splice(idx, 0, song);
    this.setStateWithUpdatedList(list);
  };

  // Transaction wrapper
  addDeleteSongTransaction = (oneBasedIndex) => {
    const t = new DeleteSong_Transaction(this, oneBasedIndex);
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
        />
        <EditToolbar
          canAddSong={canAddSong}
          canUndo={canUndo}
          canRedo={canRedo}
          canClose={canClose}
          undoCallback={this.undo}
          redoCallback={this.redo}
          closeCallback={this.closeCurrentList}
        />
        <SongCards
          currentList={this.state.currentList}
          moveSongCallback={this.addMoveSongTransaction}
          deleteSongCallback={this.addDeleteSongTransaction}
          openEditSongCallback={this.openEditSongModal}
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
