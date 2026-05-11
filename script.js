document.addEventListener('DOMContentLoaded', () => {
    // Tab Navigation Logic
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Observer for list items floating animation
    const items = document.querySelectorAll('.pro-item');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.05
    });

    items.forEach((item, index) => {
        // Stagger animation based on item index in the list
        item.style.transitionDelay = `${(index % 5) * 0.1}s`;
        observer.observe(item);
    });

    // YouTube Player API Logic
    const videoBtns = document.querySelectorAll('.video-btn-pro');
    const modal = document.getElementById('videoModal');
    const closeBtn = document.querySelector('.close-btn');

    // Function to extract video ID from any YouTube URL
    function extractVideoID(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\/shorts\/)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    videoBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();

            window.videoSrc = btn.getAttribute('data-video-src');
            const videoId = extractVideoID(window.videoSrc);

            window.onPlayerError = function (event) {
                const errorCode = event.data;
                switch (errorCode) {
                    case 2: console.error("Invalid video ID"); break;
                    case 5: console.error("HTML5 player error"); break;
                    case 100: console.error("Video not found or removed"); break;
                    case 101:
                    case 150:
                        console.error("Embedding not allowed");
                        window.open(window.videoSrc, '_blank');
                        closeModal();
                        break;
                    default: console.error("Unknown error");
                }
            }

            if (videoId) {
                if (window.ytPlayer) {
                    window.ytPlayer.loadVideoById(videoId);
                } else if (typeof YT !== 'undefined' && YT.Player) {
                    window.ytPlayer = new YT.Player('videoPlayer', {
                        videoId: videoId,
                        playerVars: { 'autoplay': 1 },
                        events: {
                            'onReady': (event) => {
                                event.target.playVideo();
                            },
                            'onError': window.onPlayerError
                        }
                    });
                }
                modal.classList.add('show');
            }
        });
    });

    const closeModal = () => {
        modal.classList.remove('show');
        setTimeout(() => {
            if (window.ytPlayer && typeof window.ytPlayer.stopVideo === 'function') {
                window.ytPlayer.stopVideo();
            }
        }, 300);
    };

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
});
