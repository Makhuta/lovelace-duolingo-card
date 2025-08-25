const LitElement = customElements.get("hui-masonry-view") ? Object.getPrototypeOf(customElements.get("hui-masonry-view")) : Object.getPrototypeOf(customElements.get("hui-view"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class DuolingoUserCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {},
    };
  }

  static get styles() {
    return css`
      :host {
        --duolingo-green: #58CC02;
        --duolingo-blue: #1CB0F6;
        --duolingo-gold: #FFC800;
      }

      .card-content {
        padding: 16px;
      }

      .user-profile {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .user-avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid var(--duolingo-green);
      }

      .user-info h4 {
        font-size: 20px;
        margin-bottom: 4px;
        color: var(--primary-text-color);
      }

      .user-info p {
        color: var(--secondary-text-color);
        margin-bottom: 8px;
      }

      .xp-display, .gems-display {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .xp-display ha-icon {
        color: var(--duolingo-gold);
      }

      .gems-display ha-icon {
        color: var(--duolingo-blue);
      }

      .error-message {
        color: var(--error-color, #ff4444);
        text-align: center;
        padding: 20px;
        font-style: italic;
      }

      @media (max-width: 768px) {
        .user-profile {
          flex-direction: column;
          text-align: center;
        }
      }
    `;
  }

  setConfig(config) {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    this.config = config;
  }

  render() {
    if (!this.config) {
      return html``;
    }

    const userData = this.getUserData();
    
    if (!userData) {
      return html`
        <ha-card header="${this.config.title}">
          <div class="card-content">
            <div class="error-message">
              ${this.config.entity ? 'Entity not found or no user data available' : 'Please configure an entity'}
            </div>
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card header="${this.config.title}">
        <div class="card-content">
          <div class="user-profile">
            <img src="${userData.avatar || userData.entityPicture || 'https://simg-ssl.duolingo.com/avatar/default_2/large'}" 
                 alt="User Avatar" class="user-avatar"
                 @error="${this._handleImageError}">
            <div class="user-info">
              <h4>${this.config.show_name ? (userData.fullname || userData.username || 'Unknown User') : (userData.username || userData.fullname || 'Unknown User')}</h4>
              <p>@${userData.username || 'unknown'}</p>
              <div class="xp-display">
                <ha-icon icon="mdi:star"></ha-icon>
                <span>${this.formatNumber(userData.total_xp || 0)}</span> XP
              </div>
              <div class="gems-display">
                <ha-icon icon="mdi:diamond"></ha-icon>
                <span>${this.formatNumber(userData.gems || 0)}</span> Gems
              </div>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  getUserData() {
    if (!this.config.entity || !this.hass.states[this.config.entity]) {
      return null;
    }

    const entity = this.hass.states[this.config.entity];
    
    if (entity.attributes.duolingo_data && entity.attributes.duolingo_data.user) {
      return entity.attributes.duolingo_data.user;
    }
    
    if (entity.attributes.user) {
      return entity.attributes.user;
    }
    
    if (entity.attributes.username || entity.attributes.fullname) {
      return entity.attributes;
    }
    
    return null;
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  _handleImageError(e) {
    e.target.src = 'https://simg-ssl.duolingo.com/avatar/default_2/large';
  }

  getCardSize() {
    return 3;
  }

  static getConfigElement() {
    return document.createElement("duolingo-user-card-editor");
  }

  static getStubConfig() {
    return {
      type: "custom:duolingo-user-card",
      entity: "",
      title: "Duolingo User"
    };
  }
}

customElements.define("duolingo-user-card", DuolingoUserCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "duolingo-user-card",
  name: "Duolingo User Card",
  description: "Displays Duolingo user profile information"
});