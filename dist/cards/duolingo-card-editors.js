const LitElement = customElements.get("hui-masonry-view") ? Object.getPrototypeOf(customElements.get("hui-masonry-view")) : Object.getPrototypeOf(customElements.get("hui-view"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

// =============================================================================
// SHARED CARD EDITOR BASE CLASS
// =============================================================================
class DuolingoCardEditor extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {},
    };
  }

  static get styles() {
    return css`
      .card-config {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px;
      }

      .option {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .option label {
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .option input {
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
      }

      .option small {
        color: var(--secondary-text-color);
        font-size: 0.9em;
      }
    `;
  }

  setConfig(config) {
    this.config = config;
  }

  firstUpdated() {
    // lazy-load the entity picker so it's registered
    import("home-assistant-frontend/src/components/entity/ha-entity-picker");
  }

  render() {
    if (!this.hass) {
      return html``;
    }

    return html`
      <div class="card-config">
        <div class="option">
          <label for="title">Title (optional)</label>
              <input
                type="text"
                id="title"
                .value=${this.config.title || ""}
                .configValue=${"title"}
                @input=${this._valueChanged}
                placeholder="${this.getDefaultTitle()}"
              />
            <small>Custom title for the card</small>
        </div>
        
        <div class="option">
          <label for="entity">Entity</label>
          ${this.renderEntityPicker()}
          <small>Select the entity containing Duolingo data</small>
        </div>
      </div>
    `;
  }

  renderEntityPicker() {
    // Check if ha-entity-picker is available (in Home Assistant)
    console.info('ha-entity-picker:', customElements.get('ha-entity-picker'));
    if (customElements.get('ha-entity-picker')) {
      return html`
        <ha-entity-picker
          .hass="${this.hass}"
          .value="${this.config.entity || ""}"
          .configValue=${"entity"}
          domain-filter="sensor"
          @value-changed="${this._valueChanged}"
          allow-custom-entity
        ></ha-entity-picker>
      `;
    } else {
      // Fallback to regular input for demo environments
      return html`
        <input
          type="text"
          id="entity"
          .value=${this.config.entity || ""}
          .configValue=${"entity"}
          @input=${this._valueChanged}
          placeholder="sensor.duolingo_data"
          style="padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color); width: 100%;"
        />
      `;
    }
  }

  getDefaultTitle() {
    return "Duolingo Card";
  }

  _valueChanged(ev) {
    if (!this.config || !this.hass) {
      return;
    }

    const target = ev.target;
    const configValue = target.configValue;
    const value = target.value;

    if (this.config[configValue] === value) {
      return;
    }

    const newConfig = {
      ...this.config,
    };

    if (value === "" || value === undefined) {
      delete newConfig[configValue];
    } else {
      newConfig[configValue] = value;
    }

    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true
    }));
  }
}

// =============================================================================
// SPECIFIC CARD EDITORS
// =============================================================================
class DuolingoUserCardEditor extends DuolingoCardEditor {
  getDefaultTitle() { return "Duolingo User"; }
}

class DuolingoStreakCardEditor extends DuolingoCardEditor {
  getDefaultTitle() { return "Duolingo Streak"; }
}

class DuolingoLanguageCardEditor extends DuolingoCardEditor {
  getDefaultTitle() { return "Duolingo Language"; }
}

class DuolinguoChallengeCardEditor extends DuolingoCardEditor {
  getDefaultTitle() { return "Monthly Challenge"; }
}

class DuolingoFriendsCardEditor extends DuolingoCardEditor {
  getDefaultTitle() { return "Duolingo Friends"; }
}

class DuolingoQuestCardEditor extends DuolingoCardEditor {
  getDefaultTitle() { return "Friend Quest"; }
}

class DuolingoFriendStreakCardEditor extends DuolingoCardEditor {
  getDefaultTitle() { return "Friend Streak"; }
}

// Register editors
customElements.define("duolingo-user-card-editor", DuolingoUserCardEditor);
customElements.define("duolingo-streak-card-editor", DuolingoStreakCardEditor);
customElements.define("duolingo-language-card-editor", DuolingoLanguageCardEditor);
customElements.define("duolingo-challenge-card-editor", DuolinguoChallengeCardEditor);
customElements.define("duolingo-friends-card-editor", DuolingoFriendsCardEditor);
customElements.define("duolingo-quest-card-editor", DuolingoQuestCardEditor);
customElements.define("duolingo-friend-streak-card-editor", DuolingoFriendStreakCardEditor);