document.addEventListener('DOMContentLoaded', () => {
    const mainElement = document.querySelector('main');
    const artistItems = document.querySelectorAll('.artist-item');

    // Ajoute un écouteur d'événements pour chaque carte d'artiste
    artistItems.forEach(item => {
        const imgElement = item.querySelector('img');
        const imageUrl = imgElement.src;

        item.addEventListener('mouseenter', () => {
            // Applique l'image de la carte en tant que variable CSS
            mainElement.style.setProperty('--background-image-url', `url('${imageUrl}')`);
            // Pas besoin d'ajouter une classe spécifique pour le flou/opacité car ils sont gérés par défaut
            // et la transition de l'image de fond se fait via la variable CSS.
        });

        item.addEventListener('mouseleave', () => {
            // Supprime la variable CSS, ce qui fait revenir au background-image par défaut (le GIF)
            mainElement.style.removeProperty('--background-image-url');
        });
    });
});