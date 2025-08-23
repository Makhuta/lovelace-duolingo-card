const LitElement = customElements.get("hui-masonry-view") ? Object.getPrototypeOf(customElements.get("hui-masonry-view")) : Object.getPrototypeOf(customElements.get("hui-view"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class DuolingoLanguageCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {},
    };
  }

  static get styles() {
    return css`
      :host {
        --duolingo-blue: #1CB0F6;
        --duolingo-gold: #FFC800;
      }

      .card-content {
        padding: 16px;
      }

      .language-display {
        text-align: center;
      }

      .language-name {
        font-size: 24px;
        font-weight: 600;
        color: var(--duolingo-blue);
        margin-bottom: 8px;
      }

      .language-xp {
        font-size: 18px;
        color: var(--duolingo-gold);
        margin-bottom: 16px;
      }

      .language-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        text-align: center;
        margin-top: 16px;
      }

      .detail-item {
        padding: 12px;
        background: var(--secondary-background-color, #f5f5f5);
        border-radius: 8px;
      }

      .detail-label {
        font-size: 12px;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .detail-value {
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .error-message {
        color: var(--error-color, #ff4444);
        text-align: center;
        padding: 20px;
        font-style: italic;
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

    const languageData = this.getLanguageData();
    
    if (!languageData) {
      return html`
        <ha-card header="${this.config.title}">
          <div class="card-content">
            <div class="error-message">
              ${this.config.entity ? 'Entity not found or no language data available' : 'Please configure an entity'}
            </div>
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card header="${this.config.title}">
        <div class="card-content">
          <div class="language-display">
            <div class="language-name">
              ${languageData.languageString || languageData.language_string || languageData.language || 'Unknown Language'}
            </div>
            <div class="language-xp">
              ${this.formatNumber(languageData.points || languageData.xp || 0)} XP
            </div>
            
            ${this.renderLanguageDetails(languageData)}
          </div>
        </div>
      </ha-card>
    `;
  }

  renderLanguageDetails(data) {
    const details = [];
    
    if (data.from) {
      details.push({
        label: 'From',
        value: data.from.toUpperCase()
      });
    }
    
    if (data.language) {
      details.push({
        label: 'Language Code',
        value: data.language.toUpperCase()
      });
    }
    
    if (details.length === 0) return '';
    
    return html`
      <div class="language-details">
        ${details.map(detail => html`
          <div class="detail-item">
            <div class="detail-label">${detail.label}</div>
            <div class="detail-value">${detail.value}</div>
          </div>
        `)}
      </div>
    `;
  }

  getLanguageData() {
    if (!this.config.entity || !this.hass.states[this.config.entity]) {
      return null;
    }

    const entity = this.hass.states[this.config.entity];

    return entity.attributes;
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  getCardSize() {
    return 3;
  }

  static getConfigElement() {
    return document.createElement("duolingo-language-card-editor");
  }

  static getStubConfig() {
    return {
      type: "custom:duolingo-language-card",
      entity: "",
      title: "Duolingo Language"
    };
  }
}

customElements.define("duolingo-language-card", DuolingoLanguageCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "duolingo-language-card",
  name: "Duolingo Language Card",
  description: "Displays Duolingo language progress information"
});