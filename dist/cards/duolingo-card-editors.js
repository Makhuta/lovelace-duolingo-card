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
    `
  }
  getEntityFilter() {
    return {
      prefix: "",
      suffix: "friend_quest"
    }
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

// Register editors
customElements.define("duolingo-user-card-editor", DuolingoUserCardEditor);
customElements.define("duolingo-streak-card-editor", DuolingoStreakCardEditor);
customElements.define("duolingo-language-card-editor", DuolingoLanguageCardEditor);
customElements.define("duolingo-leaderboard-card-editor", DuolingoLeaderboardCardEditor);
customElements.define("duolingo-challenge-card-editor", DuolinguoChallengeCardEditor);
customElements.define("duolingo-friends-card-editor", DuolingoFriendsCardEditor);
customElements.define("duolingo-quest-card-editor", DuolingoQuestCardEditor);
customElements.define("duolingo-friend-streak-card-editor", DuolingoFriendStreakCardEditor);