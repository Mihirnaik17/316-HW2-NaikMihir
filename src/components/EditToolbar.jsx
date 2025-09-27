import React from "react";

export default class EditToolbar extends React.Component {
    render() {
        const { canAddSong, canUndo, canRedo, canClose, 
                addSongCallback, undoCallback, redoCallback, closeCallback } = this.props;

        let addSongClass = "toolbar-button";
        let undoClass = "toolbar-button";
        let redoClass = "toolbar-button";
        let closeClass = "toolbar-button";

        if (!canAddSong) addSongClass += " disabled";
        if (!canUndo) undoClass += " disabled";
        if (!canRedo) redoClass += " disabled";
        if (!canClose) closeClass += " disabled";

        return (
            <div id="edit-toolbar">
                <input 
                    type="button" 
                    id='add-song-button' 
                    value="+" 
                    className={addSongClass}
                    onClick={addSongCallback}
                     disabled={!canAddSong}
                />
                <input 
                    type="button" 
                    id='undo-button' 
                    value="⟲" 
                    className={undoClass} 
                    onClick={canUndo ? undoCallback : null}
                />
                <input 
                    type="button" 
                    id='redo-button' 
                    value="⟳" 
                    className={redoClass} 
                    onClick={canRedo ? redoCallback : null}
                />
                <input 
                    type="button" 
                    id='close-button' 
                    value="✕" 
                    className={closeClass} 
                    onClick={canClose ? closeCallback : null}
                />
            </div>
        )
    }
}
