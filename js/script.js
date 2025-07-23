document.addEventListener('DOMContentLoaded', () => {
    // Sélection des éléments HTML principaux du lecteur
    const audioPlayer = document.getElementById('audioPlayer');
    const playerBar = document.querySelector('.player-bar'); // La barre de lecture principale
    const fullscreenBtn = playerBar.querySelector('.fullscreen-btn'); // Le bouton fullscreen dans le footer

    // Éléments pour la modal plein écran
    const fullscreenCoverModal = document.getElementById('fullscreenCoverModal');
    const fullscreenCoverImage = document.getElementById('fullscreenCoverImage');
    const closeModalBtn = document.querySelector('.close-modal');
    // Le nouveau conteneur pour les contrôles du lecteur en mode plein écran
    const fullscreenPlayerControlsContainer = document.querySelector('.fullscreen-player-controls');

    // La playlist mise à jour et triée alphabétiquement par titre
    const playlist = [
        {
            title: "Amoureuse",
            artist: "Tsew The Kid",
            src: "audio/Amoureuse - Tsew The Kid.mp3",
            cover: "images/cover-amoureuse.jpg"
        },
        {
            title: "C'était pas à cause de toi",
            artist: "Tsew The Kid",
            src: "audio/C'était pas à cause de toi - Tsew The Kid.mp3",
            cover: "images/cover-cetait-pas-a-cause-de-toi.jpg"
        },
        {
            title: "Cigarette",
            artist: "Tsew The Kid",
            src: "audio/Cigarette - Tsew The Kid.mp3",
            cover: "images/cover-cigarette.jpg"
        },
        {
            title: "J'espère que c'est vrai",
            artist: "Tsew The Kid",
            src: "audio/J'espère que c'est vrai - Tsew The Kid.mp3",
            cover: "images/cover-jespere-que-cest-vrai.jpg"
        },
        {
            title: "Le reste de mon passé",
            artist: "Tsew The Kid",
            src: "audio/Les restes de mon passé - Tsew The Kid.mp3",
            cover: "images/cover-les-reste-de-mon-passe.jpg"
        },
        {
            title: "Même le monde rêve d'amour",
            artist: "Tsew The Kid",
            src: "audio/Même les monstres rêvent d'amour - Tsew The Kid.mp3",
            cover: "images/cover-meme-le-monde-reve-damour.jpg"
        },
        {
            title: "Sourire",
            artist: "Tsew The Kid",
            src: "audio/Sourire - Tsew The Kid.mp3",
            cover: "images/cover-sourire.jpg"
        },
        {
            title: "Sur le cœur",
            artist: "Tsew The Kid",
            src: "audio/Sur le coeur - Tsew The Kid.mp3",
            cover: "images/cover-sur-le-coeur.jpg"
        },
        {
            title: "Toxic Boy",
            artist: "Tsew The Kid",
            src: "audio/Toxic Boy - Tsew The Kid.mp3",
            cover: "images/cover-toxic-boy.jpg"
        },
        {
            title: "Une ombre",
            artist: "Tsew The Kid",
            src: "audio/Une ombre - Tsew The Kid.mp3",
            cover: "images/cover-une-ombre.jpg"
        },
        {
            title: "Vampire",
            artist: "Tsew The Kid",
            src: "audio/Vampire - Tsew The Kid.mp3",
            cover: "images/cover-vampire.jpg"
        },
        {
            title: "Wouna",
            artist: "Tsew The Kid",
            src: "audio/Wouna - Tsew The Kid.mp3",
            cover: "images/cover-wouna.jpg"
        }
    ].sort((a, b) => a.title.localeCompare(b.title)); // Sort alphabetically by title

    let currentTrackIndex = -1;
    let isShuffling = false;
    let isRepeating = false;
    let originalVolume = audioPlayer.volume;

    // Références directes aux éléments du footer. C'est ici qu'on attachera les écouteurs pour le footer.
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


    // Variable pour stocker le clone de la barre de lecture pour la modal
    let fullscreenPlayerBarClone = null;


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
        let currentTitle = "Choisissez une chanson";
        let currentArtist = "";
        let currentCover = "";

        if (currentTrackIndex !== -1) {
            const track = playlist[currentTrackIndex];
            currentTitle = track.title;
            currentArtist = track.artist;
            currentCover = track.cover;
        }

        // Mettre à jour le footer
        footerCurrentSongTitle.textContent = currentTitle;
        footerCurrentSongArtist.textContent = currentArtist;
        footerCurrentSongCover.src = currentCover;

        // Mettre à jour la modal si elle est active
        if (fullscreenPlayerBarClone) {
            const fsSongInfo = fullscreenPlayerBarClone.querySelector('.song-info');
            if (fsSongInfo) {
                fsSongInfo.querySelector('.current-song-title').textContent = currentTitle;
                fsSongInfo.querySelector('.current-song-artist').textContent = currentArtist;
                fsSongInfo.querySelector('.current-song-cover').src = currentCover;
            }
            fullscreenCoverImage.src = currentCover; // Update the main cover image in the modal
        }
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
            updateCardActiveState(); // Met à jour la classe "active" sur la carte

            // Reset progress bars and times when a new track is loaded
            footerProgressBar.value = 0;
            updateProgressBarBackground(footerProgressBar, 0);
            footerCurrentTimeSpan.textContent = '0:00';
            footerDurationSpan.textContent = '0:00';

            // If fullscreen modal is open, update its controls
            if (fullscreenPlayerBarClone) {
                const fsProgressBar = fullscreenPlayerControlsContainer.querySelector('.progress-bar');
                const fsCurrentTimeSpan = fullscreenPlayerControlsContainer.querySelector('.current-time');
                const fsDurationSpan = fullscreenPlayerControlsContainer.querySelector('.duration');

                fsProgressBar.value = 0;
                updateProgressBarBackground(fsProgressBar, 0);
                fsCurrentTimeSpan.textContent = '0:00';
                fsDurationSpan.textContent = '0:00';
            }
        }
    }

    /**
     * Joue la chanson actuelle.
     */
    function playTrack() {
        if (audioPlayer.src) { // Only play if a source is set
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
            if (currentTrackIndex === -1 && playlist.length > 0) {
                loadTrack(0); // If no track selected, load the first one
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
            } while (randomIndex === currentTrackIndex && playlist.length > 1); // Avoid playing same song twice in a row if more than one song
            loadTrack(randomIndex);
        } else {
            currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
            loadTrack(currentTrackIndex);
        }
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
    }

    /**
     * Met à jour l'icône des boutons play/pause.
     * @param {boolean} isPlaying Indique si la musique est en lecture.
     */
    function updatePlayPauseButtons(isPlaying) {
        const playIcon = '<i class="fas fa-play"></i>';
        const pauseIcon = '<i class="fas fa-pause"></i>';

        footerPlayPauseBtn.innerHTML = isPlaying ? pauseIcon : playIcon;

        if (fullscreenPlayerBarClone) {
            fullscreenPlayerControlsContainer.querySelector('.play-pause-btn').innerHTML = isPlaying ? pauseIcon : playIcon;
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
        cardsContainer.innerHTML = ''; // Clear existing cards

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
        updateCardActiveState(); // Set initial active state if a track is already playing
    }


    // --- Écouteurs d'événements pour le lecteur ---

    // Événements pour la barre de lecture du footer
    footerPlayPauseBtn.addEventListener('click', togglePlayPause);
    footerPrevBtn.addEventListener('click', playPrevTrack);
    footerNextBtn.addEventListener('click', playNextTrack);

    footerShuffleBtn.addEventListener('click', () => {
        isShuffling = !isShuffling;
        footerShuffleBtn.classList.toggle('active', isShuffling);
        if (fullscreenPlayerBarClone) {
            fullscreenPlayerControlsContainer.querySelector('.shuffle-btn').classList.toggle('active', isShuffling);
        }
    });

    footerRepeatBtn.addEventListener('click', () => {
        isRepeating = !isRepeating;
        footerRepeatBtn.classList.toggle('active', isRepeating);
        if (fullscreenPlayerBarClone) {
            fullscreenPlayerControlsContainer.querySelector('.repeat-btn').classList.toggle('active', isRepeating);
        }
    });

    audioPlayer.addEventListener('timeupdate', () => {
        const currentTime = audioPlayer.currentTime;
        const duration = audioPlayer.duration;
        const progressPercent = (currentTime / duration) * 100;

        footerCurrentTimeSpan.textContent = formatTime(currentTime);
        footerProgressBar.value = progressPercent;
        updateProgressBarBackground(footerProgressBar, progressPercent);

        if (fullscreenPlayerBarClone) {
            const fsProgressBar = fullscreenPlayerControlsContainer.querySelector('.progress-bar');
            const fsCurrentTimeSpan = fullscreenPlayerControlsContainer.querySelector('.current-time');
            fsCurrentTimeSpan.textContent = formatTime(currentTime);
            fsProgressBar.value = progressPercent;
            updateProgressBarBackground(fsProgressBar, progressPercent);
        }
    });

    audioPlayer.addEventListener('loadedmetadata', () => {
        const duration = audioPlayer.duration;
        footerDurationSpan.textContent = formatTime(duration);
        if (fullscreenPlayerBarClone) {
            fullscreenPlayerControlsContainer.querySelector('.duration').textContent = formatTime(duration);
        }
    });

    audioPlayer.addEventListener('ended', () => {
        if (isRepeating) {
            playTrack(); // Rejoue la même chanson
        } else {
            playNextTrack(); // Passe à la suivante ou active le shuffle
        }
    });

    footerProgressBar.addEventListener('input', () => {
        const seekTime = (footerProgressBar.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekTime;
    });

    footerVolumeSlider.addEventListener('input', () => {
        audioPlayer.volume = footerVolumeSlider.value / 100;
        updateProgressBarBackground(footerVolumeSlider, footerVolumeSlider.value);
        if (fullscreenPlayerBarClone) {
            const fsVolumeSlider = fullscreenPlayerControlsContainer.querySelector('.volume-slider');
            fsVolumeSlider.value = footerVolumeSlider.value;
            updateProgressBarBackground(fsVolumeSlider, fsVolumeSlider.value);
        }
        updateVolumeIcon(audioPlayer.volume);
    });

    footerVolumeMuteBtn.addEventListener('click', () => {
        if (audioPlayer.volume > 0) {
            originalVolume = audioPlayer.volume; // Store current volume before muting
            audioPlayer.volume = 0;
            footerVolumeSlider.value = 0;
            updateProgressBarBackground(footerVolumeSlider, 0);
        } else {
            audioPlayer.volume = originalVolume; // Restore original volume
            footerVolumeSlider.value = originalVolume * 100;
            updateProgressBarBackground(footerVolumeSlider, originalVolume * 100);
        }
        updateVolumeIcon(audioPlayer.volume);
        if (fullscreenPlayerBarClone) {
            const fsVolumeSlider = fullscreenPlayerControlsContainer.querySelector('.volume-slider');
            fsVolumeSlider.value = footerVolumeSlider.value; // Sync fullscreen slider
            updateProgressBarBackground(fsVolumeSlider, fsVolumeSlider.value);
            fullscreenPlayerControlsContainer.querySelector('.volume-mute-btn').innerHTML = footerVolumeMuteBtn.innerHTML; // Sync icon
        }
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
        document.body.classList.add('blur-active'); // Apply blur to body

        // If a track is selected, update modal content
        if (currentTrackIndex !== -1) {
            const track = playlist[currentTrackIndex];
            fullscreenCoverImage.src = track.cover;
            fullscreenPlayerControlsContainer.querySelector('#fullscreenSongTitle').textContent = track.title;
            fullscreenPlayerControlsContainer.querySelector('#fullscreenSongArtist').textContent = track.artist;
            // You can add logic here to load lyrics into #fullscreenLyrics if you have them
        } else {
            fullscreenCoverImage.src = ''; // Clear image if no track
            fullscreenPlayerControlsContainer.querySelector('#fullscreenSongTitle').textContent = 'Choisissez une chanson';
            fullscreenPlayerControlsContainer.querySelector('#fullscreenSongArtist').textContent = '';
        }

        // Clone and transfer control states and values to fullscreen controls
        syncFullscreenControls();

        // Re-attach event listeners to the cloned elements
        attachFullscreenEventListeners();
    }

    function closeFullscreenModal() {
        fullscreenCoverModal.classList.remove('active');
        document.body.classList.remove('blur-active'); // Remove blur from body

        // Detach event listeners from cloned elements to prevent memory leaks
        detachFullscreenEventListeners();

        // Clear the cloned player bar content
        fullscreenPlayerControlsContainer.innerHTML = '';
        fullscreenPlayerBarClone = null; // Reset the clone reference
    }

    function syncFullscreenControls() {
        // Clear previous content to avoid duplicates
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

        // Update the song info within the fullscreen modal itself (outside the cloned controls)
        const fsSongTitle = fullscreenCoverModal.querySelector('#fullscreenSongTitle');
        const fsSongArtist = fullscreenCoverModal.querySelector('#fullscreenSongArtist');
        const fsCoverImage = fullscreenCoverModal.querySelector('#fullscreenCoverImage');

        if (currentTrackIndex !== -1) {
            const track = playlist[currentTrackIndex];
            fsSongTitle.textContent = track.title;
            fsSongArtist.textContent = track.artist;
            fsCoverImage.src = track.cover;
        } else {
            fsSongTitle.textContent = 'Choisissez une chanson';
            fsSongArtist.textContent = '';
            fsCoverImage.src = '';
        }

        const fsPlayPauseBtn = fullscreenPlayerControlsContainer.querySelector('.play-pause-btn');
        const fsShuffleBtn = fullscreenPlayerControlsContainer.querySelector('.shuffle-btn');
        const fsRepeatBtn = fullscreenPlayerControlsContainer.querySelector('.repeat-btn');
        const fsProgressBar = fullscreenPlayerControlsContainer.querySelector('.progress-bar');
        const fsCurrentTimeSpan = fullscreenPlayerControlsContainer.querySelector('.current-time');
        const fsDurationSpan = fullscreenPlayerControlsContainer.querySelector('.duration');
        const fsVolumeSlider = fullscreenPlayerControlsContainer.querySelector('.volume-slider');
        const fsVolumeMuteBtn = fullscreenPlayerControlsContainer.querySelector('.volume-mute-btn');


        // Sync play/pause state
        updatePlayPauseButtons(!audioPlayer.paused);

        // Sync shuffle/repeat state
        fsShuffleBtn.classList.toggle('active', isShuffling);
        fsRepeatBtn.classList.toggle('active', isRepeating);

        // Sync progress bar
        const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100 || 0;
        fsProgressBar.value = progressPercent;
        updateProgressBarBackground(fsProgressBar, progressPercent);
        fsCurrentTimeSpan.textContent = formatTime(audioPlayer.currentTime);
        fsDurationSpan.textContent = formatTime(audioPlayer.duration);

        // Sync volume
        fsVolumeSlider.value = audioPlayer.volume * 100;
        updateProgressBarBackground(fsVolumeSlider, audioPlayer.volume * 100);
        updateVolumeIcon(audioPlayer.volume); // Update initial icon
        fsVolumeMuteBtn.innerHTML = footerVolumeMuteBtn.innerHTML; // Sync initial icon
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

        // Play/Pause
        fsPlayPauseBtn.onclick = togglePlayPause;

        // Previous/Next
        fsPrevBtn.onclick = playPrevTrack;
        fsNextBtn.onclick = playNextTrack;

        // Shuffle
        fsShuffleBtn.onclick = () => {
            isShuffling = !isShuffling;
            fsShuffleBtn.classList.toggle('active', isShuffling);
            footerShuffleBtn.classList.toggle('active', isShuffling);
        };

        // Repeat
        fsRepeatBtn.onclick = () => {
            isRepeating = !isRepeating;
            fsRepeatBtn.classList.toggle('active', isRepeating);
            footerRepeatBtn.classList.toggle('active', isRepeating);
        };

        // Progress bar
        fsProgressBar.oninput = () => {
            const seekTime = (fsProgressBar.value / 100) * audioPlayer.duration;
            audioPlayer.currentTime = seekTime;
            updateProgressBarBackground(fsProgressBar, fsProgressBar.value);
            footerProgressBar.value = fsProgressBar.value; // Sync footer
            updateProgressBarBackground(footerProgressBar, footerProgressBar.value); // Sync footer visual
        };

        // Volume slider
        fsVolumeSlider.oninput = () => {
            audioPlayer.volume = fsVolumeSlider.value / 100;
            updateProgressBarBackground(fsVolumeSlider, fsVolumeSlider.value);
            footerVolumeSlider.value = fsVolumeSlider.value; // Sync footer
            updateProgressBarBackground(footerVolumeSlider, footerVolumeSlider.value); // Sync footer visual
            updateVolumeIcon(audioPlayer.volume); // Update footer icon
            fsVolumeMuteBtn.innerHTML = footerVolumeMuteBtn.innerHTML; // Sync fullscreen icon
        };

        // Volume Mute
        fsVolumeMuteBtn.onclick = () => {
            if (audioPlayer.volume > 0) {
                originalVolume = audioPlayer.volume;
                audioPlayer.volume = 0;
                fsVolumeSlider.value = 0;
                footerVolumeSlider.value = 0; // Sync footer
            } else {
                audioPlayer.volume = originalVolume;
                fsVolumeSlider.value = originalVolume * 100;
                footerVolumeSlider.value = originalVolume * 100; // Sync footer
            }
            updateProgressBarBackground(fsVolumeSlider, fsVolumeSlider.value);
            updateProgressBarBackground(footerVolumeSlider, footerVolumeSlider.value); // Sync footer visual
            updateVolumeIcon(audioPlayer.volume); // Update footer icon
            fsVolumeMuteBtn.innerHTML = footerVolumeMuteBtn.innerHTML; // Sync fullscreen icon
        };
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

        // Remove listeners by setting onclick to null or using removeEventListener if named functions were used
        fsPlayPauseBtn.onclick = null;
        fsPrevBtn.onclick = null;
        fsNextBtn.onclick = null;
        fsShuffleBtn.onclick = null;
        fsRepeatBtn.onclick = null;
        fsProgressBar.oninput = null;
        fsVolumeSlider.oninput = null;
        fsVolumeMuteBtn.onclick = null;
    }


    // Initialisation
    initializeMusicCards();
    // Set initial volume slider background
    updateProgressBarBackground(footerVolumeSlider, footerVolumeSlider.value);

    // Initial check for play/pause button icon on load
    updatePlayPauseButtons(!audioPlayer.paused);
});