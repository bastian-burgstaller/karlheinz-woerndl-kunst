const artworkGrid = document.querySelector(".artwork-grid");
const filterButtons = document.querySelectorAll(".filter-button");

const artworkModal = document.querySelector("#artworkModal");
const modalClose = document.querySelector("#modalClose");
const modalBackground = document.querySelector(".modal-background");

const modalImage = document.querySelector("#modalImage");
const modalCategory = document.querySelector("#modalCategory");
const modalTitle = document.querySelector("#modalTitle");
const modalDescription = document.querySelector("#modalDescription");
const modalSize = document.querySelector("#modalSize");
const modalOrientation = document.querySelector("#modalOrientation");
const modalTheme = document.querySelector("#modalTheme");
const modalStatus = document.querySelector("#modalStatus");
const modalPrice = document.querySelector("#modalPrice");
const modalRequestButton = document.querySelector("#modalRequestButton");

let allArtworks = [];
let currentModalArtwork = null;

let activeFilters = {
    orientation: "alle",
    sizeCategory: "alle",
    theme: "alle"
};

function getCurrentLanguageSafe() {
    if (typeof window.getCurrentLanguage === "function") {
        return window.getCurrentLanguage();
    }

    return "de";
}

function getArtworkText(artwork, key) {
    const language = getCurrentLanguageSafe();
    const exactKey = key + "_" + language;
    const fallbackKey = key + "_de";

    if (artwork[exactKey] !== undefined) {
        return artwork[exactKey];
    }

    if (artwork[fallbackKey] !== undefined) {
        return artwork[fallbackKey];
    }

    if (artwork[key] !== undefined) {
        return artwork[key];
    }

    return "";
}

function getTranslatedTexts() {
    const language = getCurrentLanguageSafe();

    if (language === "en") {
        return {
            requestButton: "Request artwork",
            unavailableButton: "Not available",
            emptyMessage: "No works found for these filters.",
            mailSubject: "Inquiry about artwork: ",
            status: {
                available: "Available",
                reserved: "Reserved",
                sold: "Sold"
            },
            orientation: {
                hochformat: "Portrait",
                querformat: "Landscape",
                quadratisch: "Square"
            },
            sizeCategory: {
                klein: "Small",
                mittel: "Medium",
                gross: "Large"
            },
            theme: {
                natur: "Nature",
                modern: "Modern",
                person: "Person"
            }
        };
    }

    return {
        requestButton: "Bild anfragen",
        unavailableButton: "Nicht verfügbar",
        emptyMessage: "Keine Werke für diese Filter gefunden.",
        mailSubject: "Anfrage zum Bild: ",
        status: {
            available: "Verfügbar",
            reserved: "Reserviert",
            sold: "Verkauft"
        },
        orientation: {
            hochformat: "Hochformat",
            querformat: "Querformat",
            quadratisch: "Quadratisch"
        },
        sizeCategory: {
            klein: "Klein",
            mittel: "Mittel",
            gross: "Groß"
        },
        theme: {
            natur: "Natur",
            modern: "Modern",
            person: "Person"
        }
    };
}

if (artworkGrid !== null) {
    fetch("data/artworks.json")
        .then(function(response) {
            return response.json();
        })
        .then(function(artworks) {
            allArtworks = artworks;
            showArtworks(allArtworks);
        })
        .catch(function(error) {
            console.log("Fehler beim Laden der Galerie:", error);
        });
}

filterButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        const filterType = button.dataset.filterType;
        const filterValue = button.dataset.filterValue;

        activeFilters[filterType] = filterValue;

        updateActiveButtons(filterType, button);
        filterArtworks();
    });
});

function updateActiveButtons(filterType, clickedButton) {
    filterButtons.forEach(function(button) {
        if (button.dataset.filterType === filterType) {
            button.classList.remove("active");
        }
    });

    clickedButton.classList.add("active");
}

function filterArtworks() {
    const filteredArtworks = allArtworks.filter(function(artwork) {
        const orientationMatches =
            activeFilters.orientation === "alle" ||
            artwork.orientation === activeFilters.orientation;

        const sizeMatches =
            activeFilters.sizeCategory === "alle" ||
            artwork.sizeCategory === activeFilters.sizeCategory;

        const themeMatches =
            activeFilters.theme === "alle" ||
            artwork.theme === activeFilters.theme;

        return orientationMatches && sizeMatches && themeMatches;
    });

    showArtworks(filteredArtworks);
}

function showArtworks(artworks) {
    const ui = getTranslatedTexts();

    artworkGrid.innerHTML = "";

    if (artworks.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-gallery-message";
        emptyMessage.textContent = ui.emptyMessage;

        artworkGrid.appendChild(emptyMessage);
        return;
    }

    artworks.forEach(function(artwork) {
        const card = document.createElement("article");
        card.className = "artwork-card orientation-" + artwork.orientation;

        const imageBox = document.createElement("div");
        imageBox.className =
            "artwork-image " +
            artwork.colorClass +
            " preview-" +
            artwork.orientation;

        if (artwork.image !== "") {
            const realImage = document.createElement("img");
            realImage.src = artwork.image;
            realImage.alt = getArtworkText(artwork, "title");
            realImage.className = "artwork-real-image";

            realImage.onload = function() {
                detectImageOrientation(realImage, card, imageBox);
            };

            imageBox.appendChild(realImage);
        }

        const status = document.createElement("span");
        status.className = "status-badge " + getStatusClass(artwork.status);
        status.textContent = getReadableStatus(artwork.status);

        imageBox.appendChild(status);

        const content = document.createElement("div");
        content.className = "artwork-content";

        const category = document.createElement("p");
        category.className = "artwork-category";
        category.textContent = getArtworkText(artwork, "category");

        const title = document.createElement("h3");
        title.textContent = getArtworkText(artwork, "title");

        const description = document.createElement("p");
        description.textContent = getArtworkText(artwork, "description");

        const details = document.createElement("div");
        details.className = "artwork-details";

        const orientationText = document.createElement("span");
        orientationText.textContent = getReadableOrientation(artwork.orientation);

        const sizeCategoryText = document.createElement("span");
        sizeCategoryText.textContent = getReadableSizeCategory(artwork.sizeCategory);

        const themeText = document.createElement("span");
        themeText.textContent = getReadableTheme(artwork.theme);

        details.appendChild(orientationText);
        details.appendChild(sizeCategoryText);
        details.appendChild(themeText);

        const footer = document.createElement("div");
        footer.className = "artwork-footer";

        const size = document.createElement("span");
        size.textContent = getArtworkText(artwork, "size");

        const price = document.createElement("strong");
        price.textContent = getArtworkText(artwork, "price");

        footer.appendChild(size);
        footer.appendChild(price);

        const requestButton = document.createElement("a");

        if (artwork.status === "sold") {
            requestButton.href = "#";
            requestButton.className = "artwork-button disabled";
            requestButton.textContent = ui.unavailableButton;
        } else {
            const subject = encodeURIComponent(ui.mailSubject + getArtworkText(artwork, "title"));

            requestButton.href = "mailto:karlheinz.woerndl@sbg.at?subject=" + subject;
            requestButton.className = "artwork-button";
            requestButton.textContent = ui.requestButton;
        }

        requestButton.addEventListener("click", function(event) {
            event.stopPropagation();
        });

        card.addEventListener("click", function() {
            openArtworkModal(artwork);
        });

        content.appendChild(category);
        content.appendChild(title);
        content.appendChild(description);
        content.appendChild(details);
        content.appendChild(footer);
        content.appendChild(requestButton);

        card.appendChild(imageBox);
        card.appendChild(content);

        artworkGrid.appendChild(card);
    });
}

function openArtworkModal(artwork) {
    const ui = getTranslatedTexts();

    currentModalArtwork = artwork;
    artworkModal.classList.add("open");

    modalImage.className = "modal-image " + artwork.colorClass + " modal-" + artwork.orientation;
    modalImage.style.backgroundImage = "";

    if (artwork.image !== "") {
        modalImage.style.backgroundImage = "url('" + artwork.image + "')";
    }

    modalCategory.textContent = getArtworkText(artwork, "category");
    modalTitle.textContent = getArtworkText(artwork, "title");
    modalDescription.textContent = getArtworkText(artwork, "description");

    modalSize.textContent = getArtworkText(artwork, "size");
    modalOrientation.textContent = getReadableOrientation(artwork.orientation);
    modalTheme.textContent = getReadableTheme(artwork.theme);
    modalStatus.textContent = getReadableStatus(artwork.status);

    modalPrice.textContent = getArtworkText(artwork, "price");

    if (artwork.status === "sold") {
        modalRequestButton.href = "#";
        modalRequestButton.textContent = ui.unavailableButton;
        modalRequestButton.className = "primary-button modal-disabled";
    } else {
        const subject = encodeURIComponent(ui.mailSubject + getArtworkText(artwork, "title"));
        modalRequestButton.href = "mailto:karlheinz.woerndl@sbg.at?subject=" + subject;
        modalRequestButton.textContent = ui.requestButton;
        modalRequestButton.className = "primary-button";
    }
}

function closeArtworkModal() {
    artworkModal.classList.remove("open");
    currentModalArtwork = null;
}

if (modalClose !== null) {
    modalClose.addEventListener("click", closeArtworkModal);
}

if (modalBackground !== null) {
    modalBackground.addEventListener("click", closeArtworkModal);
}

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        closeArtworkModal();
    }
});

window.addEventListener("languageChanged", function() {
    filterArtworks();

    if (currentModalArtwork !== null) {
        openArtworkModal(currentModalArtwork);
    }
});

function getStatusClass(status) {
    if (status === "available") {
        return "available";
    }

    if (status === "reserved") {
        return "reserved";
    }

    if (status === "sold") {
        return "sold";
    }

    return "";
}

function getReadableStatus(status) {
    const ui = getTranslatedTexts();

    if (ui.status[status] !== undefined) {
        return ui.status[status];
    }

    return status;
}

function getReadableOrientation(orientation) {
    const ui = getTranslatedTexts();

    if (ui.orientation[orientation] !== undefined) {
        return ui.orientation[orientation];
    }

    return orientation;
}

function getReadableSizeCategory(sizeCategory) {
    const ui = getTranslatedTexts();

    if (ui.sizeCategory[sizeCategory] !== undefined) {
        return ui.sizeCategory[sizeCategory];
    }

    return sizeCategory;
}

function getReadableTheme(theme) {
    const ui = getTranslatedTexts();

    if (ui.theme[theme] !== undefined) {
        return ui.theme[theme];
    }

    return theme;
}

function detectImageOrientation(image, card, imageBox) {
    const width = image.naturalWidth;
    const height = image.naturalHeight;

    card.classList.remove("auto-hochformat");
    card.classList.remove("auto-querformat");
    card.classList.remove("auto-quadratisch");

    imageBox.classList.remove("auto-hochformat");
    imageBox.classList.remove("auto-querformat");
    imageBox.classList.remove("auto-quadratisch");

    if (height > width) {
        card.classList.add("auto-hochformat");
        imageBox.classList.add("auto-hochformat");
    } else if (width > height) {
        card.classList.add("auto-querformat");
        imageBox.classList.add("auto-querformat");
    } else {
        card.classList.add("auto-quadratisch");
        imageBox.classList.add("auto-quadratisch");
    }
}