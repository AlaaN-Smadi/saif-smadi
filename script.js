document.addEventListener('DOMContentLoaded', () => {
    // Accordion Logic
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        const header = section.querySelector('.section-header');
        header.addEventListener('click', () => {
            // Toggle current section
            section.classList.toggle('active');
        });
    });

    // Observer for card floating animation
    const cards = document.querySelectorAll('.card');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        // Stagger animation based on card index inside the grid
        card.style.transition = `all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) ${(index % 3) * 0.1}s`;
        observer.observe(card);
    });

    // YouTube Player API Logic
    const videoBtns = document.querySelectorAll('.video-btn');
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
            e.stopPropagation(); // Prevents collapsing/expanding the section if buttons accidentally caught events

            window.videoSrc = btn.getAttribute('data-video-src');
            const videoId = extractVideoID(window.videoSrc);

            window.onPlayerError = function (event) {
                const errorCode = event.data;

                switch (errorCode) {
                    case 2:
                        console.error("Invalid video ID");
                        break;
                    case 5:
                        console.error("HTML5 player error");
                        break;
                    case 100:
                        console.error("Video not found or removed");
                        break;
                    case 101:
                    case 150:
                        console.error("Embedding not allowed");
                        // open window.videoSrc in a new tab
                        window.open(window.videoSrc, '_blank');
                        // close the video modal
                        closeModal();
                        break;
                    default:
                        console.error("Unknown error");
                }
            }

            if (videoId) {
                if (window.ytPlayer) {
                    window.ytPlayer.loadVideoById(videoId);
                    // override on error function

                } else if (typeof YT !== 'undefined' && YT.Player) {
                    // Initialize the player dynamically once the user clicks
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
        }, 300); // Wait for CSS transition to finish before stopping playback
    };

    closeBtn.addEventListener('click', closeModal);

    // Close when clicking outside of the modal content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close when pressing the escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
});
