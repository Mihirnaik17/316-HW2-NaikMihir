import React from "react";

export default class SongCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isDragSource: false,
      isDragTarget: false
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
    let targetId = event.currentTarget.id; // "song-card-5"
    targetId = targetId.substring(targetId.lastIndexOf("-") + 1);

    let sourceId = event.dataTransfer.getData("song"); // "song-card-2"
    sourceId = sourceId.substring(sourceId.lastIndexOf("-") + 1);

    this.setState({ isDragSource: false, isDragTarget: false });
    this.props.moveCallback(sourceId, targetId);
  };
  handleDragEnd = () => {
    this.setState({ isDragSource: false, isDragTarget: false });
  };
  handleDoubleClick = (e) => {
    e.stopPropagation();
    const num = Number(this.getItemNum()); // 1-based
    this.props.openEditSongCallback?.(num);
  };

  getItemNum = () => {
  const id = this.props.id;
  if (!id || !id.startsWith("song-card-")) return null;
  return id.substring("song-card-".length);
};


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
        onDoubleClick={this.handleDoubleClick}
      >
        <span className="song-index">{num}.</span>
        <span className="song-main">
          <a
            href={song.youTubeId ? `https://www.youtube.com/watch?v=${song.youTubeId}` : "#"}
            target="_blank"
            rel="noopener noreferrer"
            onMouseDown={(e) => e.stopPropagation()}
            draggable={false}
            className="song-title"
          >
            {song.title}
          </a>
          {song.year ? <span className="song-year"> ({song.year})</span> : null}
           &nbsp;<i>by</i>&nbsp;<span className="song-artist">{song.artist}</span>
        </span>

        <button
          type="button"
          draggable={false}
          className="song-trash"
          aria-label={`Delete ${song.title}`}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); deleteSongCallback?.(Number(num)); }}
        >
          🗑
        </button>

        {/* Duplicate button */}
        <button
          type="button"
          draggable={false}
          className="song-duplicate"
          aria-label={`Duplicate ${song.title}`}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            console.log("🗑 Clicked delete for song num:", num);

            this.props.duplicateSongCallback?.(Number(num));
          }}
        >
          ⎘
        </button>
      </div>
    );
  }
}
