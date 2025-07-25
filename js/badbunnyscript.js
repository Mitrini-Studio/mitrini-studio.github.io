document.addEventListener('DOMContentLoaded', () => {
    // Sélection des éléments HTML principaux du lecteur
    const audioPlayer = document.getElementById('audioPlayer');
    const playerBar = document.querySelector('.player-bar'); // La barre de lecture principale
    const fullscreenBtn = playerBar.querySelector('.fullscreen-btn');

    // Éléments pour la modal plein écran
    const fullscreenCoverModal = document.getElementById('fullscreenCoverModal');
    const fullscreenCoverImage = document.getElementById('fullscreenCoverImage');
    const closeModalBtn = document.querySelector('.close-modal');
    const fullscreenPlayerControlsContainer = document.querySelector('.fullscreen-player-controls');

    // La playlist mise à jour et triée alphabétiquement par titre
    const playlist = [
        {
            title: "DtMF",
            artist: "Bad Bunny",
            src: "audio/badbunny/DtMF - Bad Bunny.mp3",
            cover: "images/cover-dtmf.jpg"
        },
        {
            title: "BAILE INoLVIDABLE",
            artist: "Bad Bunny",
            src: "audio/badbunny/BAILE INoLVIDABLE - Bad Bunny.mp3",
            cover: "images/cover-dtmf.jpg"
        }
    ].sort((a, b) => a.title.localeCompare(b.title));

    let currentTrackIndex = -1;
    let isShuffling = false;
    let isRepeating = false;
    let originalVolume = audioPlayer.volume; // Stores volume before mute

    // Références directes aux éléments du footer.
    const footerPlayPauseBtn = playerBar.querySelector('.play-pause-btn');
    const footerPrevBtn = playerBar.querySelector('.prev-btn');
    const footerNextBtn = playerBar.querySelector('.next-btn');
    const footerShuffleBtn = playerBar.querySelector('.shuffle-btn');
    const footerRepeatBtn = playerBar.querySelector('.repeat-btn');
    const footerCurrentSongTitle = playerBar.querySelector('.song-info .current-song-title');
    const footerCurrentSongArtist = playerBar.querySelector('.song-info .current-song-artist');
    const footerCurrentSongCover = playerBar.querySelector('.song-info .current-song-cover');
    const footerProgressBar = playerBar.querySelector('.progress-bar');
    const footerCurrentTimeSpan = playerBar.querySelector('.current-time');
    const footerDurationSpan = playerBar.querySelector('.duration');
    const footerVolumeSlider = playerBar.querySelector('.volume-slider');
    const footerVolumeMuteBtn = playerBar.querySelector('.volume-mute-btn');


    /**
     * Formate un nombre de secondes en format "MM:SS".
     */
    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    /**
     * Met à jour la variable CSS --webkit-slider-progress
     * pour contrôler le remplissage visuel de la barre de progression/volume.
     */
    function updateProgressBarBackground(barElement, value) {
        if (barElement) {
            barElement.style.setProperty('--webkit-slider-progress', `${value}%`);
        }
    }

    /**
     * Met à jour les informations de la chanson (titre, artiste, pochette)
     * pour les deux barres de lecture (footer et modal si ouverte).
     */
    function updateSongInfoDisplay() {
        let titleToDisplay = ""; // No default "Choose a song" text
        let artistToDisplay = "";
        let coverToDisplay = "";

        if (currentTrackIndex !== -1 && playlist[currentTrackIndex]) {
            const track = playlist[currentTrackIndex];
            titleToDisplay = track.title;
            artistToDisplay = track.artist;
            coverToDisplay = track.cover;
        }

        // Update footer
        footerCurrentSongTitle.textContent = titleToDisplay;
        footerCurrentSongArtist.textContent = artistToDisplay;
        footerCurrentSongCover.src = coverToDisplay;
        footerCurrentSongCover.alt = titleToDisplay ? `${titleToDisplay} Cover` : ''; // Add alt text

        // Update modal if active
        if (fullscreenCoverModal.classList.contains('active')) {
            const fsSongInfoTitle = fullscreenCoverModal.querySelector('.fullscreen-song-info .current-song-title');
            const fsSongInfoArtist = fullscreenCoverModal.querySelector('.fullscreen-song-info .current-song-artist');
            if (fsSongInfoTitle) fsSongInfoTitle.textContent = titleToDisplay;
            if (fsSongInfoArtist) fsSongInfoArtist.textContent = artistToDisplay;
            fullscreenCoverImage.src = coverToDisplay;
            fullscreenCoverImage.alt = titleToDisplay ? `${titleToDisplay} Cover` : ''; // Add alt text
        }
    }

    /**
     * Sauvegarde les paramètres actuels du lecteur dans le localStorage.
     */
    function saveSettings() {
        localStorage.setItem('audioPlayerVolume', audioPlayer.volume);
        localStorage.setItem('audioPlayerCurrentTrackIndex', currentTrackIndex);
        localStorage.setItem('audioPlayerShuffleState', isShuffling);
        localStorage.setItem('audioPlayerRepeatState', isRepeating);
    }

    /**
     * Charge les paramètres du lecteur depuis le localStorage.
     */
    function loadSettings() {
        const savedVolume = localStorage.getItem('audioPlayerVolume');
        const savedTrackIndex = localStorage.getItem('audioPlayerCurrentTrackIndex');
        const savedShuffle = localStorage.getItem('audioPlayerShuffleState');
        const savedRepeat = localStorage.getItem('audioPlayerRepeatState');

        // Restore volume
        if (savedVolume !== null) {
            audioPlayer.volume = parseFloat(savedVolume);
            footerVolumeSlider.value = audioPlayer.volume * 100;
            updateProgressBarBackground(footerVolumeSlider, footerVolumeSlider.value);
            updateVolumeIcon(audioPlayer.volume);
            originalVolume = audioPlayer.volume > 0 ? audioPlayer.volume : 0.5; // Ensure originalVolume isn't 0 if muted on load
        } else {
            // Default volume if no setting saved (e.g., first visit)
            audioPlayer.volume = 0.5; // Default to 50% volume
            footerVolumeSlider.value = 50;
            updateProgressBarBackground(footerVolumeSlider, 50);
            updateVolumeIcon(0.5);
            originalVolume = 0.5;
        }

        // Restore shuffle state
        if (savedShuffle !== null) {
            isShuffling = (savedShuffle === 'true');
            footerShuffleBtn.classList.toggle('active', isShuffling);
        }

        // Restore repeat state
        if (savedRepeat !== null) {
            isRepeating = (savedRepeat === 'true');
            footerRepeatBtn.classList.toggle('active', isRepeating);
        }

        // Restore last played track or pick a random one
        if (savedTrackIndex !== null && playlist.length > 0) {
            const index = parseInt(savedTrackIndex, 10);
            if (index >= 0 && index < playlist.length) {
                currentTrackIndex = index;
                audioPlayer.src = playlist[currentTrackIndex].src;
                updateSongInfoDisplay();
                updateCardActiveState();
            } else {
                // Saved index invalid, pick random
                currentTrackIndex = Math.floor(Math.random() * playlist.length);
                audioPlayer.src = playlist[currentTrackIndex].src;
                updateSongInfoDisplay();
                updateCardActiveState();
            }
        } else if (playlist.length > 0) {
            // No saved track, pick a random one for the first time
            currentTrackIndex = Math.floor(Math.random() * playlist.length);
            audioPlayer.src = playlist[currentTrackIndex].src;
            updateSongInfoDisplay();
            updateCardActiveState();
        }
        // If playlist is empty, currentTrackIndex remains -1, and no track is loaded.
    }

    /**
     * Charge et joue une chanson.
     * @param {number} index L'index de la chanson dans la playlist.
     */
    function loadTrack(index) {
        if (index >= 0 && index < playlist.length) {
            currentTrackIndex = index;
            const track = playlist[currentTrackIndex];
            audioPlayer.src = track.src;
            updateSongInfoDisplay();
            playTrack();
            updateCardActiveState();

            // Reset progress bars and times when a new track is loaded
            footerProgressBar.value = 0;
            updateProgressBarBackground(footerProgressBar, 0);
            footerCurrentTimeSpan.textContent = '0:00';
            footerDurationSpan.textContent = '0:00';

            // If fullscreen modal is open, update its controls
            if (fullscreenCoverModal.classList.contains('active')) {
                const fsProgressBar = fullscreenPlayerControlsContainer.querySelector('.progress-bar');
                const fsCurrentTimeSpan = fullscreenPlayerControlsContainer.querySelector('.current-time');
                const fsDurationSpan = fullscreenPlayerControlsContainer.querySelector('.duration');

                if (fsProgressBar && fsCurrentTimeSpan && fsDurationSpan) {
                    fsProgressBar.value = 0;
                    updateProgressBarBackground(fsProgressBar, 0);
                    fsCurrentTimeSpan.textContent = '0:00';
                    fsDurationSpan.textContent = '0:00';
                }
            }
            saveSettings(); // Save the new track index
        }
    }

    /**
     * Joue la chanson actuelle.
     */
    function playTrack() {
        if (audioPlayer.src) {
            audioPlayer.play();
            updatePlayPauseButtons(true);
        }
    }

    /**
     * Met en pause la chanson actuelle.
     */
    function pauseTrack() {
        audioPlayer.pause();
        updatePlayPauseButtons(false);
    }

    /**
     * Bascule entre lecture et pause.
     */
    function togglePlayPause() {
        if (audioPlayer.paused) {
            // If no track is loaded, and playlist is not empty, load the initial track (which is now random on first load)
            if (currentTrackIndex === -1 && playlist.length > 0) {
                 // This case should ideally not be hit if loadSettings works correctly on init
                 // But as a fallback, load the first track
                loadTrack(0);
            } else {
                playTrack();
            }
        } else {
            pauseTrack();
        }
    }

    /**
     * Passe à la chanson suivante dans la playlist.
     */
    function playNextTrack() {
        if (playlist.length === 0) return;

        if (isRepeating) {
            loadTrack(currentTrackIndex);
        } else if (isShuffling) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * playlist.length);
            } while (randomIndex === currentTrackIndex && playlist.length > 1);
            loadTrack(randomIndex);
        } else {
            currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
            loadTrack(currentTrackIndex);
        }
        saveSettings(); // Save changes after track change
    }

    /**
     * Passe à la chanson précédente dans la playlist.
     */
    function playPrevTrack() {
        if (playlist.length === 0) return;

        if (isRepeating) {
            loadTrack(currentTrackIndex);
        } else if (isShuffling) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * playlist.length);
            } while (randomIndex === currentTrackIndex && playlist.length > 1);
            loadTrack(randomIndex);
        } else {
            currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
            loadTrack(currentTrackIndex);
        }
        saveSettings(); // Save changes after track change
    }

    /**
     * Met à jour l'icône des boutons play/pause.
     * @param {boolean} isPlaying Indique si la musique est en lecture.
     */
    function updatePlayPauseButtons(isPlaying) {
        const playIcon = '<i class="fas fa-play"></i>';
        const pauseIcon = '<i class="fas fa-pause"></i>';

        footerPlayPauseBtn.innerHTML = isPlaying ? pauseIcon : playIcon;

        if (fullscreenCoverModal.classList.contains('active')) {
            const fsPlayPauseBtn = fullscreenPlayerControlsContainer.querySelector('.play-pause-btn');
            if (fsPlayPauseBtn) {
                fsPlayPauseBtn.innerHTML = isPlaying ? pauseIcon : playIcon;
            }
        }
    }

    /**
     * Met à jour la classe 'active' sur la carte de la chanson actuellement jouée.
     */
    function updateCardActiveState() {
        document.querySelectorAll('.card').forEach((card, index) => {
            if (index === currentTrackIndex) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    /**
     * Initialise les cartes de musique.
     */
    function initializeMusicCards() {
        const cardsContainer = document.querySelector('.cards-container');
        cardsContainer.innerHTML = '';

        playlist.forEach((track, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.trackIndex = index;
            card.innerHTML = `
                <img src="${track.cover}" alt="${track.title} Cover">
                <h3>${track.title}</h3>
                <p>${track.artist}</p>
            `;
            card.addEventListener('click', () => loadTrack(index));
            cardsContainer.appendChild(card);
        });
        updateCardActiveState();
    }


    // --- Écouteurs d'événements pour le lecteur ---

    footerPlayPauseBtn.addEventListener('click', togglePlayPause);
    footerPrevBtn.addEventListener('click', playPrevTrack);
    footerNextBtn.addEventListener('click', playNextTrack);

    footerShuffleBtn.addEventListener('click', () => {
        isShuffling = !isShuffling;
        footerShuffleBtn.classList.toggle('active', isShuffling);
        if (fullscreenCoverModal.classList.contains('active')) {
            const fsShuffleBtn = fullscreenPlayerControlsContainer.querySelector('.shuffle-btn');
            if (fsShuffleBtn) fsShuffleBtn.classList.toggle('active', isShuffling);
        }
        saveSettings(); // Save shuffle state
    });

    footerRepeatBtn.addEventListener('click', () => {
        isRepeating = !isRepeating;
        footerRepeatBtn.classList.toggle('active', isRepeating);
        if (fullscreenCoverModal.classList.contains('active')) {
            const fsRepeatBtn = fullscreenPlayerControlsContainer.querySelector('.repeat-btn');
            if (fsRepeatBtn) fsRepeatBtn.classList.toggle('active', isRepeating);
        }
        saveSettings(); // Save repeat state
    });

    audioPlayer.addEventListener('timeupdate', () => {
        const currentTime = audioPlayer.currentTime;
        const duration = audioPlayer.duration;
        const progressPercent = (duration > 0) ? (currentTime / duration) * 100 : 0;

        footerCurrentTimeSpan.textContent = formatTime(currentTime);
        footerProgressBar.value = progressPercent;
        updateProgressBarBackground(footerProgressBar, progressPercent);

        if (fullscreenCoverModal.classList.contains('active')) {
            const fsProgressBar = fullscreenPlayerControlsContainer.querySelector('.progress-bar');
            const fsCurrentTimeSpan = fullscreenPlayerControlsContainer.querySelector('.current-time');
            if (fsProgressBar && fsCurrentTimeSpan) {
                fsCurrentTimeSpan.textContent = formatTime(currentTime);
                fsProgressBar.value = progressPercent;
                updateProgressBarBackground(fsProgressBar, progressPercent);
            }
        }
    });

    audioPlayer.addEventListener('loadedmetadata', () => {
        const duration = audioPlayer.duration;
        footerDurationSpan.textContent = formatTime(duration);
        if (fullscreenCoverModal.classList.contains('active')) {
            const fsDurationSpan = fullscreenPlayerControlsContainer.querySelector('.duration');
            if (fsDurationSpan) fsDurationSpan.textContent = formatTime(duration);
        }
    });

    audioPlayer.addEventListener('ended', () => {
        if (isRepeating) {
            playTrack();
        } else {
            playNextTrack();
        }
    });

    footerProgressBar.addEventListener('input', () => {
        const seekTime = (footerProgressBar.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekTime;
    });

    footerVolumeSlider.addEventListener('input', () => {
        audioPlayer.volume = footerVolumeSlider.value / 100;
        updateProgressBarBackground(footerVolumeSlider, footerVolumeSlider.value);
        if (fullscreenCoverModal.classList.contains('active')) {
            const fsVolumeSlider = fullscreenPlayerControlsContainer.querySelector('.volume-slider');
            if (fsVolumeSlider) {
                fsVolumeSlider.value = footerVolumeSlider.value;
                updateProgressBarBackground(fsVolumeSlider, fsVolumeSlider.value);
            }
        }
        updateVolumeIcon(audioPlayer.volume);
        saveSettings(); // Save volume
    });

    footerVolumeMuteBtn.addEventListener('click', () => {
        if (audioPlayer.volume > 0) {
            originalVolume = audioPlayer.volume;
            audioPlayer.volume = 0;
            footerVolumeSlider.value = 0;
            updateProgressBarBackground(footerVolumeSlider, 0);
        } else {
            audioPlayer.volume = originalVolume;
            footerVolumeSlider.value = originalVolume * 100;
            updateProgressBarBackground(footerVolumeSlider, originalVolume * 100);
        }
        updateVolumeIcon(audioPlayer.volume);
        if (fullscreenCoverModal.classList.contains('active')) {
            const fsVolumeSlider = fullscreenPlayerControlsContainer.querySelector('.volume-slider');
            const fsVolumeMuteBtn = fullscreenPlayerControlsContainer.querySelector('.volume-mute-btn');
            if (fsVolumeSlider && fsVolumeMuteBtn) {
                fsVolumeSlider.value = footerVolumeSlider.value;
                updateProgressBarBackground(fsVolumeSlider, fsVolumeSlider.value);
                fsVolumeMuteBtn.innerHTML = footerVolumeMuteBtn.innerHTML;
            }
        }
        saveSettings(); // Save volume (muted or unmuted)
    });

    function updateVolumeIcon(volume) {
        const volumeHigh = '<i class="fas fa-volume-up"></i>';
        const volumeLow = '<i class="fas fa-volume-down"></i>';
        const volumeMuted = '<i class="fas fa-volume-mute"></i>';

        let icon = volumeHigh;
        if (volume === 0) {
            icon = volumeMuted;
        } else if (volume < 0.5) {
            icon = volumeLow;
        }
        footerVolumeMuteBtn.innerHTML = icon;
    }

    // --- Fonctions et écouteurs pour la modal plein écran ---

    fullscreenBtn.addEventListener('click', openFullscreenModal);
    closeModalBtn.addEventListener('click', closeFullscreenModal);

    function openFullscreenModal() {
        fullscreenCoverModal.classList.add('active');

        // Update modal content based on currentTrackIndex
        updateSongInfoDisplay();

        syncFullscreenControls();
        attachFullscreenEventListeners();
    }

    function closeFullscreenModal() {
        fullscreenCoverModal.classList.remove('active');
        detachFullscreenEventListeners();
        fullscreenPlayerControlsContainer.innerHTML = '';
    }

    function syncFullscreenControls() {
        fullscreenPlayerControlsContainer.innerHTML = `
            <div class="player-controls-row">
                <button class="shuffle-btn"><i class="fas fa-random"></i></button>
                <button class="prev-btn"><i class="fas fa-backward"></i></button>
                <button class="play-pause-btn"><i class="fas fa-play"></i></button>
                <button class="next-btn"><i class="fas fa-forward"></i></button>
                <button class="repeat-btn"><i class="fas fa-redo"></i></button>
            </div>
            <div class="progress-bar-container">
                <span class="current-time">0:00</span>
                <input type="range" id="fullscreenProgressBar" class="progress-bar" value="0" step="0.01">
                <span class="duration">0:00</span>
            </div>
            <div class="volume-controls-row">
                <button class="volume-mute-btn"><i class="fas fa-volume-up"></i></button>
                <input type="range" id="fullscreenVolumeSlider" class="volume-slider" value="100" step="1">
            </div>
        `;

        // Update song info display for the modal itself
        updateSongInfoDisplay();

        const fsPlayPauseBtn = fullscreenPlayerControlsContainer.querySelector('.play-pause-btn');
        const fsShuffleBtn = fullscreenPlayerControlsContainer.querySelector('.shuffle-btn');
        const fsRepeatBtn = fullscreenPlayerControlsContainer.querySelector('.repeat-btn');
        const fsProgressBar = fullscreenPlayerControlsContainer.querySelector('.progress-bar');
        const fsCurrentTimeSpan = fullscreenPlayerControlsContainer.querySelector('.current-time');
        const fsDurationSpan = fullscreenPlayerControlsContainer.querySelector('.duration');
        const fsVolumeSlider = fullscreenPlayerControlsContainer.querySelector('.volume-slider');
        const fsVolumeMuteBtn = fullscreenPlayerControlsContainer.querySelector('.volume-mute-btn');

        updatePlayPauseButtons(!audioPlayer.paused);

        if (fsShuffleBtn) fsShuffleBtn.classList.toggle('active', isShuffling);
        if (fsRepeatBtn) fsRepeatBtn.classList.toggle('active', isRepeating);

        const progressPercent = (audioPlayer.duration > 0) ? (audioPlayer.currentTime / audioPlayer.duration) * 100 : 0;
        if (fsProgressBar) {
            fsProgressBar.value = progressPercent;
            updateProgressBarBackground(fsProgressBar, progressPercent);
        }
        if (fsCurrentTimeSpan) fsCurrentTimeSpan.textContent = formatTime(audioPlayer.currentTime);
        if (fsDurationSpan) fsDurationSpan.textContent = formatTime(audioPlayer.duration);

        const currentVolumePercent = audioPlayer.volume * 100;
        if (fsVolumeSlider) {
            fsVolumeSlider.value = currentVolumePercent;
            updateProgressBarBackground(fsVolumeSlider, currentVolumePercent);
        }
        if (fsVolumeMuteBtn) fsVolumeMuteBtn.innerHTML = footerVolumeMuteBtn.innerHTML; // Sync icon
    }


    function attachFullscreenEventListeners() {
        const fsPlayPauseBtn = fullscreenPlayerControlsContainer.querySelector('.play-pause-btn');
        const fsPrevBtn = fullscreenPlayerControlsContainer.querySelector('.prev-btn');
        const fsNextBtn = fullscreenPlayerControlsContainer.querySelector('.next-btn');
        const fsShuffleBtn = fullscreenPlayerControlsContainer.querySelector('.shuffle-btn');
        const fsRepeatBtn = fullscreenPlayerControlsContainer.querySelector('.repeat-btn');
        const fsProgressBar = fullscreenPlayerControlsContainer.querySelector('.progress-bar');
        const fsVolumeSlider = fullscreenPlayerControlsContainer.querySelector('.volume-slider');
        const fsVolumeMuteBtn = fullscreenPlayerControlsContainer.querySelector('.volume-mute-btn');

        if (fsPlayPauseBtn) fsPlayPauseBtn.onclick = togglePlayPause;
        if (fsPrevBtn) fsPrevBtn.onclick = playPrevTrack;
        if (fsNextBtn) fsNextBtn.onclick = playNextTrack;

        if (fsShuffleBtn) {
            fsShuffleBtn.onclick = () => {
                isShuffling = !isShuffling;
                fsShuffleBtn.classList.toggle('active', isShuffling);
                footerShuffleBtn.classList.toggle('active', isShuffling);
                saveSettings();
            };
        }

        if (fsRepeatBtn) {
            fsRepeatBtn.onclick = () => {
                isRepeating = !isRepeating;
                fsRepeatBtn.classList.toggle('active', isRepeating);
                footerRepeatBtn.classList.toggle('active', isRepeating);
                saveSettings();
            };
        }

        if (fsProgressBar) {
            fsProgressBar.oninput = () => {
                const seekTime = (fsProgressBar.value / 100) * audioPlayer.duration;
                audioPlayer.currentTime = seekTime;
                updateProgressBarBackground(fsProgressBar, fsProgressBar.value);
                footerProgressBar.value = fsProgressBar.value;
                updateProgressBarBackground(footerProgressBar, footerProgressBar.value);
            };
        }

        if (fsVolumeSlider) {
            fsVolumeSlider.oninput = () => {
                audioPlayer.volume = fsVolumeSlider.value / 100;
                updateProgressBarBackground(fsVolumeSlider, fsVolumeSlider.value);
                footerVolumeSlider.value = fsVolumeSlider.value;
                updateProgressBarBackground(footerVolumeSlider, footerVolumeSlider.value);
                updateVolumeIcon(audioPlayer.volume);
                if (fsVolumeMuteBtn) fsVolumeMuteBtn.innerHTML = footerVolumeMuteBtn.innerHTML;
                saveSettings();
            };
        }

        if (fsVolumeMuteBtn) {
            fsVolumeMuteBtn.onclick = () => {
                if (audioPlayer.volume > 0) {
                    originalVolume = audioPlayer.volume;
                    audioPlayer.volume = 0;
                    if (fsVolumeSlider) fsVolumeSlider.value = 0;
                    footerVolumeSlider.value = 0;
                } else {
                    audioPlayer.volume = originalVolume;
                    if (fsVolumeSlider) fsVolumeSlider.value = originalVolume * 100;
                    footerVolumeSlider.value = originalVolume * 100;
                }
                if (fsVolumeSlider) updateProgressBarBackground(fsVolumeSlider, fsVolumeSlider.value);
                updateProgressBarBackground(footerVolumeSlider, footerVolumeSlider.value);
                updateVolumeIcon(audioPlayer.volume);
                fsVolumeMuteBtn.innerHTML = footerVolumeMuteBtn.innerHTML;
                saveSettings();
            };
        }
    }

    function detachFullscreenEventListeners() {
        const fsPlayPauseBtn = fullscreenPlayerControlsContainer.querySelector('.play-pause-btn');
        const fsPrevBtn = fullscreenPlayerControlsContainer.querySelector('.prev-btn');
        const fsNextBtn = fullscreenPlayerControlsContainer.querySelector('.next-btn');
        const fsShuffleBtn = fullscreenPlayerControlsContainer.querySelector('.shuffle-btn');
        const fsRepeatBtn = fullscreenPlayerControlsContainer.querySelector('.repeat-btn');
        const fsProgressBar = fullscreenPlayerControlsContainer.querySelector('.progress-bar');
        const fsVolumeSlider = fullscreenPlayerControlsContainer.querySelector('.volume-slider');
        const fsVolumeMuteBtn = fullscreenPlayerControlsContainer.querySelector('.volume-mute-btn');

        if (fsPlayPauseBtn) fsPlayPauseBtn.onclick = null;
        if (fsPrevBtn) fsPrevBtn.onclick = null;
        if (fsNextBtn) fsNextBtn.onclick = null;
        if (fsShuffleBtn) fsShuffleBtn.onclick = null;
        if (fsRepeatBtn) fsRepeatBtn.onclick = null;
        if (fsProgressBar) fsProgressBar.oninput = null;
        if (fsVolumeSlider) fsVolumeSlider.oninput = null;
        if (fsVolumeMuteBtn) fsVolumeMuteBtn.onclick = null;
    }


    // Initialisation
    initializeMusicCards();
    loadSettings(); // Load saved settings (volume, last track, shuffle/repeat)
    updateProgressBarBackground(footerVolumeSlider, footerVolumeSlider.value);
    updatePlayPauseButtons(!audioPlayer.paused); // Set initial play/pause button icon
});