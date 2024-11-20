export class DuolingoProfileCard extends HTMLElement {
    constructor() {
        super()
    }

    setConfig(config) {
        if (!config.entity) {
            throw new Error("Define entity.");
        }
        this.config = {...config};
        this.entity = config.entity;
        this.rounded = config.rounded || null;
    }

    set hass(hass) {
        if(!this.content) {
            const card = document.createElement("ha-card");
            card.header = this.config.title;
            this.content = document.createElement("div");
            this.content.style.margin = "2%";
            this.content.style.display = "flex";
            card.appendChild(this.content);
            
            const avatar_div = document.createElement("div");
            avatar_div.style.width = "20%";
            avatar_div.style.paddingRight = "2%";
            avatar_div.style.margin = "auto";
            const info_div = document.createElement("div");
            //info_div.style.backgroundColor = "red";
            info_div.style.width = "80%";
            this.content.appendChild(avatar_div);
            this.content.appendChild(info_div);


            const info_table = document.createElement("table");
            info_div.appendChild(info_table);
            info_table.style.height = "100%";
            info_table.style.width = "100%";
            const info_tbody = document.createElement("tbody");
            info_table.appendChild(info_tbody);
            

            const first_row = document.createElement("tr");
            const seccond_row = document.createElement("tr");
            const third_row = document.createElement("tr");
            info_tbody.appendChild(first_row);
            info_tbody.appendChild(seccond_row);
            info_tbody.appendChild(third_row);


            this.first_row_first_item = document.createElement("td");
            this.first_row_seccond_item = document.createElement("td");
            first_row.appendChild(this.first_row_first_item);
            first_row.appendChild(this.first_row_seccond_item);

            this.seccond_row_first_item = document.createElement("td");
            this.seccond_row_seccond_item = document.createElement("td");
            seccond_row.appendChild(this.seccond_row_first_item);
            seccond_row.appendChild(this.seccond_row_seccond_item);

            var third_row_first_item = document.createElement("td");
            const third_row_seccond_item = document.createElement("td");
            third_row_seccond_item.style.display = "flex";
            third_row.appendChild(third_row_first_item);
            third_row.appendChild(third_row_seccond_item);


            this.first_row_first_item.innerText = "ID: ";
            this.first_row_seccond_item.innerText = "Fullname: ";

            this.seccond_row_first_item.innerText = "Total XP: ";
            this.seccond_row_seccond_item.innerText = "Gems: ";

            this.learning = document.createElement("p");
            third_row_first_item.appendChild(this.learning);
            this.learning.innerText = "Learning: ";
            this.learning.style.margin = "0";
            this.learning.style.height = "100%";
            this.learning.style.verticalAlign = "text-top";

            this.languages_list = document.createElement("ul");
            this.languages_list.style.listStyleType = "none";
            this.languages_list.style.paddingLeft = "0";
            this.languages_list.style.margin = "0";
            var languages_label = document.createElement("p");
            languages_label.innerText = "Languages:";
            languages_label.style.paddingRight = "5%";
            languages_label.style.margin = "0";
            third_row_seccond_item.appendChild(languages_label);
            third_row_seccond_item.appendChild(this.languages_list);


            this.avatar_image = document.createElement("img");
            this.avatar_image.style.width = "100%";
            avatar_div.appendChild(this.avatar_image);

            this.appendChild(card);
        }
        
        const entity = hass.states[this.entity]
        if (!entity) return;

        this.avatar_image.src = entity.attributes.avatar || "";
        if(this.config.border) {
            if(this.config.border == "rounded") {
                this.avatar_image.style.borderRadius = "10%";
            } else if (this.config.border == "circle") {
                this.avatar_image.style.borderRadius = "50%";
            }
        }

        this.first_row_first_item.innerText = "ID: " + ("id" in entity.attributes ? entity.attributes.id : "unknown");
        this.first_row_seccond_item.innerText = "Fullname: " + ("fullname" in entity.attributes ? entity.attributes.fullname : "unknown");

        this.seccond_row_first_item.innerText = "Total XP: " + ("total_xp" in entity.attributes ? entity.attributes.total_xp : "unknown");
        this.seccond_row_seccond_item.innerText = "Gems: " + ("gems" in entity.attributes ? entity.attributes.gems : "unknown");

        this.learning.innerText = "Learning: " + ("learning_language" in entity.attributes ? entity.attributes.learning_language : "unknown");

        if("languages" in entity.attributes) {
            if(this.languages_list.children.length > entity.attributes.languages.length) {
                for(var i = 0; i < this.languages_list.children.length; ++i) {
                    var child = this.languages_list.children[i];
                    if(i < entity.attributes.languages.length) {
                        console.info(child);
                    } else {
                        this.languages_list.removeChild(child)
                    }
                }
            } else {
                for(var i = 0; i < entity.attributes.languages.length; ++i) {
                    var child = this.languages_list.children[i];
                    if(i < this.languages_list.children.length) {
                        child.innerText = entity.attributes.languages[i];
                    } else {
                        child = document.createElement("li");
                        child.innerText = entity.attributes.languages[i];
                        this.languages_list.appendChild(child);
                        console.info(child);
                    }
                }
            }
        }

        return
    }

    static getConfigElement() {
        return document.createElement("duolingo-card-editor");
    }

    static getStubConfig() {
        return { entity: null, title: null, show_all: false };
    }

    getCardSize() {
        return 1;
    }
}

customElements.define("duolingo-profile-card", DuolingoProfileCard);

// Configure the preview in the Lovelace card picker
window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === 'duolingo-profile-card')) {
  window.customCards.push({
    type: 'duolingo-profile-card',
    name: 'Duolingo Profile Card',
    preview: true,
    description: 'The Upcoming Media card displays upcoming episodes and movies from services like: Plex, Kodi, Radarr, Sonarr, and Trakt.',
    previewImage: 'https://github.com/custom-cards/upcoming-media-card/blob/master/image.png?raw=true',
    schema: [
        {
            name: "title",
            selector: {
                text: {}
            },
            label: "ui.panel.lovelace.editor.card.generic.title"
        },
        {
            name: "entity",
            required: true,
            selector: { entity: {
                    domain: "sensor",
                    integration: "duolingo",
                }
            },
            label: "ui.panel.lovelace.editor.card.entity.name"
        },
        {
            name: "border",
            required: true,
            selector: { 
                select: {
                    options: [
                        { value: "none", label: "None"},
                        { value: "rounded", label: "Rounded"},
                        { value: "circle", label: "Circle"}
                    ],
                    mode: "dropdown"
                }
             },
            label: "Border"
        }
    ],
  });
}