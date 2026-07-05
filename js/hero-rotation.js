const HERO_CHANGE_INTERVAL = 8000;

const heroArtworkImage = document.querySelector("#heroArtworkImage");
const heroArtworkTitle = document.querySelector("#heroArtworkTitle");

let heroArtworks = [];
let currentHeroArtwork = null;
let heroInterval = null;

function getHeroLanguage() {
    if (typeof window.getCurrentLanguage === "function") {
        return window.getCurrentLanguage();
    }

    return "de";
}

function getHeroTitle(artwork) {
    const language = getHeroLanguage();

    if (language === "en") {
        return artwork.title_en || artwork.title_de;
    }

    return artwork.title_de || artwork.title_en;
}

function updateHeroText() {
    if (currentHeroArtwork === null || heroArtworkTitle === null) {
        return;
    }

    heroArtworkTitle.textContent =
        "„" + getHeroTitle(currentHeroArtwork) + "“";

    if (heroArtworkImage !== null) {
        heroArtworkImage.alt =
            getHeroTitle(currentHeroArtwork) +
            " – Kunstwerk von Karl-Heinz Wörndl";
    }
}

function chooseRandomHeroArtwork() {
    if (heroArtworks.length === 0) {
        return null;
    }

    const previousImage =
        currentHeroArtwork?.image ||
        localStorage.getItem("lastHeroArtwork");

    const possibleArtworks = heroArtworks.filter(function(artwork) {
        return artwork.image !== previousImage;
    });

    const selectionPool =
        possibleArtworks.length > 0
            ? possibleArtworks
            : heroArtworks;

    const randomIndex = Math.floor(
        Math.random() * selectionPool.length
    );

    return selectionPool[randomIndex];
}

function showHeroArtwork(artwork, animate = true) {
    if (
        artwork === null ||
        heroArtworkImage === null ||
        heroArtworkTitle === null
    ) {
        return;
    }

    const preloadImage = new Image();

    preloadImage.onload = function() {
        const changeImage = function() {
            currentHeroArtwork = artwork;

            heroArtworkImage.src = artwork.image;

            localStorage.setItem(
                "lastHeroArtwork",
                artwork.image
            );

            updateHeroText();

            heroArtworkImage.classList.remove("is-changing");
            heroArtworkTitle.classList.remove("is-changing");
        };

        if (animate) {
            heroArtworkImage.classList.add("is-changing");
            heroArtworkTitle.classList.add("is-changing");

            window.setTimeout(changeImage, 320);
        } else {
            changeImage();
        }
    };

    preloadImage.src = artwork.image;
}

function changeHeroArtwork() {
    const nextArtwork = chooseRandomHeroArtwork();
    showHeroArtwork(nextArtwork, true);
}

function startHeroRotation() {
    if (heroInterval !== null) {
        window.clearInterval(heroInterval);
    }

    heroInterval = window.setInterval(
        changeHeroArtwork,
        HERO_CHANGE_INTERVAL
    );
}

fetch("data/artworks.json")
    .then(function(response) {
        if (!response.ok) {
            throw new Error("Die Kunstwerke konnten nicht geladen werden.");
        }

        return response.json();
    })
    .then(function(artworks) {
        const mountainArtwork = {
            title_de: "Gipfelruhe",
            title_en: "Quiet Summit",
            image: "images/artworks/hero-bergbild.jpg"
        };

        heroArtworks = [mountainArtwork].concat(
            artworks.filter(function(artwork) {
                return artwork.image !== undefined &&
                       artwork.image !== "";
            })
        );

        const firstArtwork = chooseRandomHeroArtwork();

        showHeroArtwork(firstArtwork, false);
        startHeroRotation();
    })
    .catch(function(error) {
        console.error(
            "Fehler beim Laden des wechselnden Hero-Bildes:",
            error
        );
    });

window.addEventListener("languageChanged", function() {
    updateHeroText();
});

document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
        if (heroInterval !== null) {
            window.clearInterval(heroInterval);
        }
    } else {
        startHeroRotation();
    }
});