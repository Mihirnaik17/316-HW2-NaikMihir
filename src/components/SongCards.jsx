import React from "react";
import SongCard from "./SongCard.jsx";

export default class SongCards extends React.Component {
  render() {
    const { currentList, moveSongCallback, deleteSongCallback } = this.props;
    if (currentList === null) return <div id="song-cards"></div>;
    return (
      <div id="song-cards">
        {currentList.songs.map((song, index) => (
          <SongCard
            id={`song-card-${index + 1}`}
            key={`song-card-${index + 1}`}
            song={song}
            moveCallback={moveSongCallback}
            deleteSongCallback={deleteSongCallback}
          />
        ))}
      </div>
    );
  }
}
