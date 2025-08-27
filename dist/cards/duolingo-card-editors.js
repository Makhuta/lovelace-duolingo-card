const viewEl = customElements.get("hui-masonry-view") || customElements.get("hui-view");
const LitElement = viewEl ? Object.getPrototypeOf(viewEl) : null;
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

  getConfigFields() {
    return html``
  }

  getEntityFilter() {
    return {
      prefix: "",
      suffix: ""
    }
  }

  getEntityFilterExact() {
    return {
      prefixExact: [false],
      suffixExact: [false]
    }
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

      .entity-selectors {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 8px;
      }

      .add-entity-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 8px 16px;
        background: var(--primary-color);
        color: var(--text-primary-color);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        margin-top: 8px;
      }

      .add-entity-button:hover {
        background: var(--primary-color);
        opacity: 0.8;
      }

      .entity-selector-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .entity-selector-row ha-select {
        flex: 1;
      }

      .remove-entity-button {
        min-width: 40px;
        height: 40px;
        background: var(--error-color, #ff4444);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .remove-entity-button:hover {
        opacity: 0.8;
      }
    `;
  }

  setConfig(config) {
    this.config = config;
  }

  render() {
    if (!this.hass) {
      return html``;
    }

    return html`
      <div class="card-config">
        <div class="option">
          <ha-textfield
            label="Title (optional)"
            .value=${this.config?.title ?? ""}
            .configValue=${"title"}
            @input=${this._valueChanged}
            placeholder=${this.getDefaultTitle()}
            helper="Custom title for the card"
          ></ha-textfield>
        </div>
        
        ${this.renderEntityPicker()}

        ${this.getConfigFields()}
      </div>
    `;
  }

  normalizeFilter(filter) {
    if (typeof filter === "string") {
      return [{ value: filter, exact: false }];
    }
    if (Array.isArray(filter)) {
      return filter.map(item =>
        typeof item === "string" ? { value: item, exact: false } : item
      );
    }
    if (typeof filter === "object" && filter.value) {
      return [{ value: filter.value, exact: !!filter.exact }];
    }
    return [];
  }

  renderEntityPicker() {
    const entityFilter = this.getEntityFilter();
    const prefixes = this.normalizeFilter(entityFilter.prefix);
    const suffixes = this.normalizeFilter(entityFilter.suffix);

    if (prefixes.length !== suffixes.length) {
      console.warn("Prefix and suffix arrays must have the same length");
    }

    const options = Object.entries(this.hass.states)
      .filter(([entityId]) => {
        const domain = entityId.split(".")[0];
        if (domain !== "sensor") return false;

        const parts = entityId.split("_duolingo_");
        if (parts.length !== 2) return false;

        const entityPrefix = parts[0].split(".")[1];
        const entitySuffix = parts[1];

        for (let i = 0; i < prefixes.length; i++) {
          const prefix = prefixes[i] || { value: "", exact: false };
          const suffix = suffixes[i] || { value: "", exact: false };

          const prefixMatch = prefix.exact
            ? entityPrefix === prefix.value
            : entityPrefix.endsWith(prefix.value);

          const suffixMatch = suffix.exact
            ? entitySuffix === suffix.value
            : entitySuffix.startsWith(suffix.value);

          if (prefixMatch && suffixMatch) return true;
        }

        return false;
      })
      .map(([entityId]) => ({
        label: entityId,
        value: entityId,
      }));

    return html`${this.renderDropdown("Entity", options, "entity")}`;
  }

  renderDropdown(label, options = [], selectedValueKey = "mode") {
    return html`
      <div class="option">
        <ha-select
          .label=${label}
          .value=${this.config ? this.config[selectedValueKey] : "" ?? ""}
          .configValue=${selectedValueKey}
          @selected=${this._dropdownChanged}
          @closed="${e => e.stopPropagation()}" 
        >
          ${options.map(
            (opt) => html`<mwc-list-item value=${opt.value}>${opt.label}</mwc-list-item>`
          )}
        </ha-select>
        <small>Select an option</small>
      </div>
    `;
  }

  getDefaultTitle() {
    return "Duolingo Card";
  }

  _valueChanged(ev) {
    if (!this.config || !this.hass) return;

    const target = ev.target;
    const configValue = target.configValue;

    // Handle both textfields/selects and switches
    const value = target.checked !== undefined ? target.checked : target.value;

    if (this.config[configValue] === value) return;

    const newConfig = { ...this.config };

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

  _dropdownChanged(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    const target = ev.target;
    const configValue = target.configValue;
    const value = target.value;

    if (this.config[configValue] === value) return;

    const newConfig = { ...this.config };
    newConfig[configValue] = value;

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
  getConfigFields() {
    return html`
      ${show_name_toggle(this)}
    `
  }
  getEntityFilter() {
    return {
      prefix: "",
      suffix: "user"
    }
  }
}

class DuolingoStreakCardEditor extends DuolingoCardEditor {
  getDefaultTitle() { return "Duolingo Streak"; }
  getEntityFilter() {
    return {
      prefix: "",
      suffix: "streak"
    }
  }
}

class DuolingoLanguageCardEditor extends DuolingoCardEditor {
  getDefaultTitle() { return "Duolingo Language"; }
  getEntityFilter() {
    return {
      prefix: "",
      suffix: "language"
    }
  }
}

class DuolingoLeaderboardCardEditor extends DuolingoCardEditor {
  getDefaultTitle() { return "Duolingo Leaderboard"; }
  getConfigFields() {
    return html`
      ${show_name_toggle(this)}
      ${max_people_field(this)}
    `
  }
  getEntityFilter() {
    return {
      prefix: ["leaderboard", "leaderboard", ""],
      suffix: ["today", "week", { value: "leaderboard", exact: true }]
    }
  }
}

class DuolinguoChallengeCardEditor extends DuolingoCardEditor {
  getDefaultTitle() { return "Monthly Challenge"; }
  getEntityFilter() {
    return {
      prefix: "",
      suffix: "monthly"
    }
  }
}

class DuolingoFriendsCardEditor extends DuolingoCardEditor {
  getDefaultTitle() { return "Duolingo Friends"; }
  getConfigFields() {
    return html`
      ${show_name_toggle(this)}
      ${max_people_field(this)}
    `
  }
  getEntityFilter() {
    return {
      prefix: "",
      suffix: "friends"
    }
  }
}

class DuolingoQuestCardEditor extends DuolingoCardEditor {
  getDefaultTitle() { return "Friend Quest"; }
  getConfigFields() {
    return html`
      ${show_name_toggle(this)}
      ${show_state_toggle(this)}
      ${show_points_toggle(this)}
    `
  }

  getEntityFilter() {
    return {
      prefix: "",
      suffix: "friend_quest"
    }
  }

  renderEntityPicker() {
    const entityFilter = this.getEntityFilter();
    const prefixes = this.normalizeFilter(entityFilter.prefix);
    const suffixes = this.normalizeFilter(entityFilter.suffix);

    const allOptions = Object.entries(this.hass.states)
      .filter(([entityId]) => {
        const domain = entityId.split(".")[0];
        if (domain !== "sensor") return false;

        const parts = entityId.split("_duolingo_");
        if (parts.length !== 2) return false;

        const entityPrefix = parts[0].split(".")[1];
        const entitySuffix = parts[1];

        for (let i = 0; i < prefixes.length; i++) {
          const prefix = prefixes[i] || { value: "", exact: false };
          const suffix = suffixes[i] || { value: "", exact: false };

          const prefixMatch = prefix.exact
            ? entityPrefix === prefix.value
            : entityPrefix.endsWith(prefix.value);

          const suffixMatch = suffix.exact
            ? entitySuffix === suffix.value
            : entitySuffix.startsWith(suffix.value);

          if (prefixMatch && suffixMatch) return true;
        }

        return false;
      })
      .map(([entityId]) => ({
        label: entityId,
        value: entityId,
      }));

    // Get current entities (supporting both legacy single entity and new multiple entities)
    const currentEntities = this.getCurrentEntities();

    return html`
      <div class="option">
        <label>Quest Entities</label>
        <div class="entity-selectors">
          ${currentEntities.map((entityId, index) => 
            this.renderEntitySelector(allOptions, entityId, index)
          )}
        </div>
        <button 
          type="button" 
          class="add-entity-button"
          @click=${this._addEntity}
        >
          <ha-icon icon="mdi:plus"></ha-icon>
          Add Entity
        </button>
        <small>Select quest entities. Duplicates based on User ID/You ID pairs will be automatically deduplicated.</small>
      </div>
    `;
  }

  renderEntitySelector(allOptions, selectedEntity, index) {
    // Filter out already selected entities (except current one)
    const currentEntities = this.getCurrentEntities();
    const availableOptions = allOptions.filter(option => 
      option.value === selectedEntity || !currentEntities.includes(option.value)
    );

    return html`
      <div class="entity-selector-row">
        <ha-select
          .label=${"Entity " + (index + 1)}
          .value=${selectedEntity || ""}
          .configValue=${index}
          @selected=${this._entityChanged}
          @closed="${e => e.stopPropagation()}"
        >
          <mwc-list-item value="">-- Select Entity --</mwc-list-item>
          ${availableOptions.map(
            (opt) => html`<mwc-list-item value=${opt.value}>${opt.label}</mwc-list-item>`
          )}
        </ha-select>
        ${currentEntities.length > 1 ? html`
          <button 
            type="button" 
            class="remove-entity-button"
            @click=${() => this._removeEntity(index)}
          >
            <ha-icon icon="mdi:minus"></ha-icon>
          </button>
        ` : ''}
      </div>
    `;
  }

  getCurrentEntities() {
    // Support both legacy single entity and new multiple entities format
    if (this.config && this.config.entities) {
      return [...this.config.entities];
    } else if (this.config && this.config.entity) {
      return [this.config.entity];
    }
    return [''];
  }

  _addEntity() {
    const currentEntities = this.getCurrentEntities();
    const newEntities = [...currentEntities, ''];
    this._updateEntities(newEntities);
  }

  _removeEntity(index) {
    const currentEntities = this.getCurrentEntities();
    if (currentEntities.length > 1) {
      const newEntities = currentEntities.filter((_, i) => i !== index);
      this._updateEntities(newEntities);
    }
  }

  _entityChanged(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    
    const target = ev.target;
    const index = parseInt(target.configValue, 10);
    const value = target.value;

    const currentEntities = this.getCurrentEntities();
    const newEntities = [...currentEntities];
    newEntities[index] = value;

    this._updateEntities(newEntities);
  }

  _updateEntities(entities) {
    const newConfig = { ...this.config };
    
    // Remove legacy single entity field if it exists
    if (newConfig.entity) {
      delete newConfig.entity;
    }

    newConfig.entities = entities;

    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: newConfig },
      bubbles: true,
      composed: true
    }));
  }
}

class DuolingoFriendStreakCardEditor extends DuolingoCardEditor {
  getDefaultTitle() { return "Friend Streak"; }
  getConfigFields() {
    return html`
      ${show_name_toggle(this)}
    `
  }
  getEntityFilter() {
    return {
      prefix: "",
      suffix: "friend_streak"
    }
  }
}


function max_people_field(t) {
  return html`
      <div class="option">
        <ha-textfield
          label="Max number of people in leaderboard"
          type="number"
          .value=${t.config?.max_people ?? 0}
          min="0"
          .configValue=${"max_people"}
          @input=${t._valueChanged}
          helper="0 = show all"
        ></ha-textfield>
      </div>
    `
}

function show_name_toggle(t) {
  return html`
    <div class="option">
      <ha-formfield label="Show name">
        <ha-switch
          .checked=${t.config?.show_name ?? false}
          .configValue=${"show_name"}
          @change=${t._valueChanged}
        ></ha-switch>
    </ha-formfield>
    </div>
  `
}

function show_state_toggle(t) {
  return html`
    <div class="option">
      <ha-formfield label="Show state">
        <ha-switch
          .checked=${t.config?.show_state ?? false}
          .configValue=${"show_state"}
          @change=${t._valueChanged}
        ></ha-switch>
    </ha-formfield>
    </div>
  `
}

function show_points_toggle(t) {
  return html`
    <div class="option">
      <ha-formfield label="Show points">
        <ha-switch
          .checked=${t.config?.show_points ?? false}
          .configValue=${"show_points"}
          @change=${t._valueChanged}
        ></ha-switch>
    </ha-formfield>
    </div>
  `
}

// Register editors
customElements.define("duolingo-user-card-editor", DuolingoUserCardEditor);
customElements.define("duolingo-streak-card-editor", DuolingoStreakCardEditor);
customElements.define("duolingo-language-card-editor", DuolingoLanguageCardEditor);
customElements.define("duolingo-leaderboard-card-editor", DuolingoLeaderboardCardEditor);
customElements.define("duolingo-challenge-card-editor", DuolinguoChallengeCardEditor);
customElements.define("duolingo-friends-card-editor", DuolingoFriendsCardEditor);
customElements.define("duolingo-quest-card-editor", DuolingoQuestCardEditor);
customElements.define("duolingo-friend-streak-card-editor", DuolingoFriendStreakCardEditor);