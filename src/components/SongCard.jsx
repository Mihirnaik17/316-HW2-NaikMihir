import React from "react";

export default class SongCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isDragSource: false,  // the card being dragged
      isDragTarget: false   // the card currently hovered as a drop target
    };
  }

  handleDragStart = (event) => {
    event.dataTransfer.setData("song", event.currentTarget.id);
    this.setState({ isDragSource: true });
  };

  handleDragOver = (event) => {
    event.preventDefault();
    if (!this.state.isDragTarget) this.setState({ isDragTarget: true });
  };

  handleDragEnter = (event) => {
    event.preventDefault();
    if (!this.state.isDragTarget) this.setState({ isDragTarget: true });
  };

  handleDragLeave = (event) => {
    event.preventDefault();
    if (this.state.isDragTarget) this.setState({ isDragTarget: false });
  };

  handleDrop = (event) => {
    event.preventDefault();

    let targetId = event.currentTarget.id;                 // "song-card-5"
    targetId = targetId.substring(targetId.lastIndexOf("-") + 1);

    let sourceId = event.dataTransfer.getData("song");     // "song-card-2"
    sourceId = sourceId.substring(sourceId.lastIndexOf("-") + 1);

    // Reset local flags and ask parent to move
    this.setState({ isDragSource: false, isDragTarget: false });
    this.props.moveCallback(sourceId, targetId);
  };

  // If drag ends without a drop on this card (e.g., escape)
  handleDragEnd = () => {
    this.setState({ isDragSource: false, isDragTarget: false });
  };

  getItemNum = () => this.props.id.substring("song-card-".length);

  render() {
    const { song, deleteSongCallback } = this.props;
    const num = this.getItemNum();

    let itemClass = "song-card unselected-song-card";
    if (this.state.isDragSource) itemClass += " song-drag-source";
    if (this.state.isDragTarget) itemClass += " song-drag-target";

    return (
      <div
        id={`song-card-${num}`}
        className={itemClass}
        draggable="true"
        onDragStart={this.handleDragStart}
        onDragOver={this.handleDragOver}
        onDragEnter={this.handleDragEnter}
        onDragLeave={this.handleDragLeave}
        onDrop={this.handleDrop}
        onDragEnd={this.handleDragEnd}
      >
        <span className="song-index">{num}.</span>
        <span className="song-main">
          {song.title} <i>by</i> {song.artist}
        </span>
        <button
          className="song-trash"
          aria-label={`Delete ${song.title}`}
          onMouseDown={(e) => { /* avoid starting a drag */ e.stopPropagation(); }}
          onClick={(e) => { e.stopPropagation(); deleteSongCallback(Number(num)); }}
        >
          🗑️
        </button>
      </div>
    );
  }
}
