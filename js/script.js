// static/js/script.js
document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const player = document.querySelector('.video-player');
    const controls = document.querySelector('.controls');
    const playPauseBtn = document.querySelector('.play-pause');
    const playIcon = playPauseBtn.querySelector('.play');
    const pauseIcon = playPauseBtn.querySelector('.pause');
    const seekBar = document.querySelector('.seek-bar');
    const progressBar = document.querySelector('.progress-bar');
    const progressFill = document.querySelector('.progress-fill');
    const volumeBtn = document.querySelector('.volume');
    const volumeBar = document.querySelector('.volume-bar');
    const volumeProgress = document.querySelector('.volume-progress');
    const volumeFill = document.querySelector('.volume-fill');
    const pipBtn = document.querySelector('.pip');
    const fullscreenBtn = document.querySelector('.fullscreen');
    const logoOverlay = document.querySelector('.logo-overlay');

    let hideTimeout;
    let isMouseOver = false;

    if (player.classList.contains('loop')) {
        video.loop = true;
    }

    function updatePlayPauseState() {
        if (video.paused || video.ended) {
            playIcon.style.display = 'inline';
            pauseIcon.style.display = 'none';
        } else {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'inline';
        }
    }

    function showControls() {
        controls.classList.add('visible');
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
            controls.classList.remove('visible');
        }, 3000);
    }

    function scheduleHideControls() {
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
            controls.classList.remove('visible');
        }, 3000);
    }

    player.addEventListener('mouseenter', () => {
        isMouseOver = true;
        showControls();
    });
    player.addEventListener('mousemove', showControls);
    player.addEventListener('mouseleave', () => {
        isMouseOver = false;
        scheduleHideControls();
    });

    player.addEventListener('keydown', (e) => {
        if (!isMouseOver) return;
        switch (e.key) {
            case 'f':
                if (!document.fullscreenElement) {
                    player.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
                break;
            case ' ':
                e.preventDefault();
                if (video.paused || video.ended) {
                    video.play();
                } else {
                    video.pause();
                }
                updatePlayPauseState();
                break;
        }
    });

    player.tabIndex = 0;

    video.addEventListener('click', (e) => {
        e.stopPropagation();
        if (video.paused || video.ended) {
            video.play();
        } else {
            video.pause();
        }
        updatePlayPauseState();
    });

    video.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        if (!document.fullscreenElement) {
            player.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    video.addEventListener('wheel', (e) => {
        if (!isMouseOver) return;
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        let newVolume = Math.max(0, Math.min(1, video.volume + delta));
        video.volume = newVolume;
        video.muted = newVolume === 0;
        volumeBar.value = newVolume;
        volumeFill.style.width = `${newVolume * 100}%`;
        updateVolumeIcon();
    });

    video.addEventListener('play', updatePlayPauseState);
    video.addEventListener('pause', updatePlayPauseState);
    video.addEventListener('ended', () => {
        updatePlayPauseState();
        if (!video.loop) {
            video.currentTime = 0;
            seekBar.value = 0;
            progressFill.style.width = '0%';
            logoOverlay.style.display = 'flex';
        }
    });

    video.addEventListener('play', () => {
        logoOverlay.style.display = 'none';
    });

    playPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (video.paused || video.ended) {
            video.play();
        } else {
            video.pause();
        }
        updatePlayPauseState();
    });

    progressBar.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const barWidth = rect.width;
        const seekPercentage = (clickX / barWidth) * 100;
        const seekTime = (seekPercentage / 100) * video.duration;

        video.currentTime = seekTime;
        seekBar.value = seekPercentage;
        progressFill.style.width = `${seekPercentage}%`;

        if (video.paused || video.ended) {
            video.play();
        }
        updatePlayPauseState();
    });

    seekBar.addEventListener('input', () => {
        const time = video.duration * (seekBar.value / 100);
        video.currentTime = time;
        progressFill.style.width = `${seekBar.value}%`;
    });

    video.addEventListener('timeupdate', () => {
        const value = (video.currentTime / video.duration) * 100;
        seekBar.value = value;
        progressFill.style.width = `${value}%`;
    });

    video.addEventListener('loadedmetadata', () => {
        seekBar.max = video.duration;
    });

    volumeProgress.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = volumeProgress.getBoundingClientRect();
        const clickX = player.classList.contains('vertical') ? (rect.bottom - e.clientY) : (e.clientX - rect.left);
        const barSize = player.classList.contains('vertical') ? rect.height : rect.width;
        const volumePercentage = clickX / barSize;

        video.volume = volumePercentage;
        video.muted = volumePercentage === 0;
        volumeBar.value = volumePercentage;
        volumeFill.style.width = `${volumePercentage * 100}%`;
        updateVolumeIcon();
    });

    volumeBar.addEventListener('input', () => {
        video.volume = volumeBar.value;
        video.muted = volumeBar.value === 0;
        volumeFill.style.width = `${volumeBar.value * 100}%`;
        updateVolumeIcon();
    });

    volumeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        video.muted = !video.muted;
        if (!video.muted) {
            video.volume = volumeBar.value || 1;
        }
        volumeFill.style.width = `${video.muted ? 0 : video.volume * 100}%`;
        updateVolumeIcon();
    });

    video.addEventListener('leavepictureinpicture', () => {
        updateVolumeIcon();
        volumeBar.value = video.volume;
        volumeFill.style.width = `${video.volume * 100}%`;
    });

    pipBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!document.pictureInPictureEnabled) {
            console.error('Picture-in-Picture is not supported in this browser.');
            return;
        }
        try {
            if (document.pictureInPictureElement === video) {
                await document.exitPictureInPicture();
            } else {
                if (video.paused) {
                    await video.play();
                }
                await video.requestPictureInPicture();
            }
        } catch (error) {
            console.error('Failed to toggle Picture-in-Picture:', error);
        }
    });

    fullscreenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!document.fullscreenElement) {
            player.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    function updateVolumeIcon() {
        if (video.muted || video.volume === 0) {
            volumeBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>`;
        } else {
            volumeBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>`;
        }
    }

    updatePlayPauseState();
    updateVolumeIcon();
    volumeFill.style.width = `${video.volume * 100}%`;
    progressFill.style.width = '0%';
});