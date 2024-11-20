export class DuolingoFriendsCard extends HTMLElement {
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

    get_rounded() {
        if(this.config.border) {
            if(this.config.border == "rounded") {
                return "10%";
            } else if (this.config.border == "circle") {
                return "50%";
            }
        }
        return "0";
    }

    removeChildTree(element) {
        for(var child in element.children) {
            this.removeChildTree(child);
            element.removeChild(child);
        }
    }

    make_profile_element(data) {
        var element = document.createElement("ha-card");
        element.style.display = "flex";
        element.style.padding = "2%";
        element.style.marginBottom = "2%";
        element.style.background = "rgba(255, 255, 255, 0.05)";
        var avatar_div = document.createElement("div");
        avatar_div.style.width = "20%";
        avatar_div.style.paddingRight = "2%";
        avatar_div.style.margin = "auto";
        var info_table = document.createElement("table");
        var info_tbody = document.createElement("tbody");
        info_table.appendChild(info_tbody)
        info_table.style.width = "80%";
        element.appendChild(avatar_div);
        element.appendChild(info_table);

        var picture_img = document.createElement("img");
        picture_img.src = "picture" in data ? data.picture : "";
        picture_img.style.borderRadius = this.get_rounded();
        picture_img.dataset.id = "avatar";
        avatar_div.appendChild(picture_img)


        const first_row = document.createElement("tr");
        const seccond_row = document.createElement("tr");
        const third_row = document.createElement("tr");
        info_tbody.appendChild(first_row);
        info_tbody.appendChild(seccond_row);
        info_tbody.appendChild(third_row);


        const first_row_first_item = document.createElement("td");
        first_row_first_item.style.width = "50%"
        const first_row_seccond_item = document.createElement("td");
        first_row.appendChild(first_row_first_item);
        first_row.appendChild(first_row_seccond_item);

        const seccond_row_first_item = document.createElement("td");
        const seccond_row_seccond_item = document.createElement("td");
        seccond_row.appendChild(seccond_row_first_item);
        seccond_row.appendChild(seccond_row_seccond_item);

        const third_row_first_item = document.createElement("td");
        const third_row_seccond_item = document.createElement("td");
        third_row_seccond_item.style.display = "flex";
        third_row.appendChild(third_row_first_item);
        third_row.appendChild(third_row_seccond_item);



        var name = document.createElement("p")
        name.style.margin = "0";
        name.dataset.id = "name";
        first_row_first_item.appendChild(name);
        name.innerText = "Name: " + ("display_name" in data ? data.display_name : "unknown");

        var username = document.createElement("p")
        username.style.margin = "0";
        username.dataset.id = "username";
        first_row_seccond_item.appendChild(username);
        username.innerText = "Username: " + ("username" in data ? data.username : "unknown");


        var premium = document.createElement("p")
        premium.style.margin = "0";
        premium.dataset.id = "premium";
        seccond_row_first_item.appendChild(premium);
        premium.innerText = "Premium: " + ("has_subscribtion" in data ? (data.has_subscribtion ? "True" : "False") : "False");

        var online = document.createElement("p")
        online.style.margin = "0";
        online.dataset.id = "online";
        seccond_row_seccond_item.appendChild(online);
        online.innerText = "Online: " + ("is_currently_active" in data ? (data.is_currently_active ? "True" : "False") : "False");


        var id = document.createElement("p")
        id.style.margin = "0";
        id.dataset.id = "id";
        third_row_first_item.appendChild(id);
        id.innerText = "ID: " + ("user_id" in data ? data.user_id : "unknown");

        var total_xp = document.createElement("p")
        total_xp.style.margin = "0";
        total_xp.dataset.id = "total_xp";
        third_row_seccond_item.appendChild(total_xp);
        total_xp.innerText = "Total XP: " + ("total_xp" in data ? data.total_xp : "unknown");


        return element;
    }

    edit_profile_element(element, data) {
        var name = element.querySelectorAll("[data-id=name]")[0];
        if(name) {
            name.innerText = "Name: " + ("display_name" in data ? data.display_name : "unknown");
        }
        var username = element.querySelectorAll("[data-id=username]")[0];
        if(username) {
            username.innerText = "Username: " + ("username" in data ? data.username : "unknown");
        }
        var premium = element.querySelectorAll("[data-id=premium]")[0];
        if(premium) {
            premium.innerText = "Premium: " + ("has_subscribtion" in data ? (data.has_subscribtion ? "True" : "False") : "False");
        }
        var online = element.querySelectorAll("[data-id=online]")[0];
        if(online) {
            online.innerText = "Online: " + ("is_currently_active" in data ? (data.is_currently_active ? "True" : "False") : "False");
        }
        var id = element.querySelectorAll("[data-id=id]")[0];
        if(id) {
            id.innerText = "ID: " + ("user_id" in data ? data.user_id : "unknown");
        }
        var total_xp = element.querySelectorAll("[data-id=total_xp]")[0];
        if(total_xp) {
            total_xp.innerText = "Total XP: " + ("total_xp" in data ? data.total_xp : "unknown");
        }
        
    }

    filter_attributes(list) {
        var output = list.filter((word) => { return !["icon", "friendly_name"].includes(word)})
        return output
    }

    order_friends(friends, data) {
        if(this.config.order_by && ["display_name", "total_xp", "user_id", "username"].includes(this.config.order_by)) {
            var friends_stats = []
            var sort_type = this.config.sort_type ? (this.config.sort_type == "asc" ? -1 : 1) : 1;
            for(var friend of friends) {
                friends_stats.push({
                    key: friend,
                    value: data[friend][this.config.order_by]
                })
            }
            friends_stats.sort((a, b) => {
                if(a.value < b.value) return (-1 * sort_type);
                if(a.value > b.value) return (1 * sort_type);
                return 0;
            })

            return friends_stats.map(function(d) {return d.key});
        }
        return friends
    }

    get_friends(keys, attrs) {
        var output = {};
        for(var key of keys) {
            output[key] = attrs[key];
        }
        return output
    }

    set hass(hass) {
        if(!this.content) {
            const card = document.createElement("ha-card");
            card.header = this.config.title;
            this.content = document.createElement("div");
            this.content.style.margin = "2%";
            this.content.style.display = "block";
            card.appendChild(this.content);
            this.appendChild(card);
        }
        
        const entity = hass.states[this.entity]
        if (!entity) return;

        var friends_keys = this.filter_attributes(Object.keys(entity.attributes));
        var friends = this.get_friends(friends_keys, entity.attributes);
        friends_keys = this.order_friends(friends_keys, friends);

        if(this.content.children.length > friends_keys.length) {
            for(var i = 0; i < this.content.children.length; ++i) {
                var child = this.content.children[i];
                if(i < friends_keys.length) {
                    this.edit_profile_element(child, friends[friends_keys[i]])
                } else {
                    this.content.removeChild(child)
                }
            }
        } else {
            for(var i = 0; i < friends_keys.length; ++i) {
                var child = this.content.children[i];
                if(i < this.content.children.length) {
                    this.edit_profile_element(child, friends[friends_keys[i]])
                } else {
                    child = this.make_profile_element(friends[friends_keys[i]]);
                    this.content.appendChild(child);
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

customElements.define("duolingo-friends-card", DuolingoFriendsCard);

// Configure the preview in the Lovelace card picker
window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === 'duolingo-friends-card')) {
  window.customCards.push({
    type: 'duolingo-friends-card',
    name: 'Duolingo Friends Card',
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