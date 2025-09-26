import React, { Component } from "react";

export default class EditSongModal extends Component {
  constructor(props) {
    super(props);
    const { song } = props;
    this.state = {
      title: song?.title || "",
      artist: song?.artist || "",
      year: song?.year ?? "",
      youTubeId: song?.youTubeId || "",
    };
  }

  componentDidUpdate(prevProps) {
    // If the song being edited changes (e.g., user double-clicked another row),
    // sync the form fields to the new song.
    if (this.props.song !== prevProps.song) {
      const s = this.props.song || {};
      this.setState({
        title: s.title || "",
        artist: s.artist || "",
        year: s.year ?? "",
        youTubeId: s.youTubeId || "",
      });
    }
  }

  handleKeyDown = (e) => {
    if (e.key === "Enter") this.handleConfirm();
    if (e.key === "Escape") this.handleCancel();
  };

  handleConfirm = () => {
    const { onConfirm } = this.props;
    const { title, artist, year, youTubeId } = this.state;

    // Trim values; year left as-is if you want to allow blanks
    const payload = {
      title: String(title).trim(),
      artist: String(artist).trim(),
      year: String(year).trim() === "" ? "" : String(year).trim(),
      youTubeId: String(youTubeId).trim(),
    };

    onConfirm && onConfirm(payload);
  };

  handleCancel = () => {
    const { onCancel } = this.props;
    onCancel && onCancel();
  };

  render() {
    // Keep the same modal shell & classes as DeleteListModal for visual consistency.
    return (
      <div
        className="modal"
        id="edit-song-modal"
        data-animation="slideInOutLeft"
        onKeyDown={this.handleKeyDown}
      >
        <div className="modal-root" id="edit-song-root">
          <div className="modal-north">Edit Song</div>

          <div className="modal-center">
            <div className="modal-center-content">
              <div className="modal-prompt" id="title-prompt">Title:</div>
              <input
                className="modal-textfield"
                id="edit-song-title-input"
                type="text"
                value={this.state.title}
                onChange={(e) => this.setState({ title: e.target.value })}
              />

              <div className="modal-prompt">Artist:</div>
              <input
                className="modal-textfield"
                id="edit-song-artist-input"
                type="text"
                value={this.state.artist}
                onChange={(e) => this.setState({ artist: e.target.value })}
              />

              <div className="modal-prompt">Year:</div>
              <input
                className="modal-textfield"
                id="edit-song-year-input"
                type="text"
                value={this.state.year}
                onChange={(e) => this.setState({ year: e.target.value })}
              />

              <div className="modal-prompt">YouTube Id:</div>
              <input
                className="modal-textfield"
                id="edit-song-youtubeid-input"
                type="text"
                value={this.state.youTubeId}
                onChange={(e) => this.setState({ youTubeId: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-south">
            <input
              type="button"
              id="edit-song-confirm-button"
              className="modal-button"
              value="Confirm"
              onClick={this.handleConfirm}
            />
            <input
              type="button"
              id="edit-song-cancel-button"
              className="modal-button"
              value="Cancel"
              onClick={this.handleCancel}
            />
          </div>
        </div>
      </div>
    );
  }
}
