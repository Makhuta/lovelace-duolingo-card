import {
    LitElement,
    html,
} from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";


class DuolingoCardEditor extends LitElement {
    static get properties() {
        return {
            hass: {},
            config: {},
            schema: Array
        };
    }

    setConfig(config) {
        this.config = config;
        const customCard = window.customCards.find(card => card.type === config.type.replace("custom:", "") );
        this.schema = customCard ? customCard.schema : [];
    }

    render() {
        if (!this.hass || !this.config) {
            return html``;
        }

        return html`
            <ha-form
            .hass=${this.hass}
            .data=${this.config}
            .schema=${this.schema}
            .computeLabel=${this._computeLabel}
            @value-changed=${this._valueChanged}
            ></ha-form>
        `;
    }

    _valueChanged(ev) {
        const newConfig = { ...ev.detail.value };
        if(newConfig.title) {
            newConfig.title = newConfig.title.charAt(0).toUpperCase() + newConfig.title.slice(1).toLowerCase()
        }
        this.configChanged(newConfig);
    }

    _computeLabel(schemaItem) {
        if(schemaItem.label) {
            return this.hass.localize(schemaItem.label) || schemaItem.label;
        }
        return schemaItem.name || "unknown";
    }

    
    configChanged(newConfig) {
        this.dispatchEvent(new CustomEvent("config-changed", {
            detail: { config: newConfig },
            bubbles: true,
            composed: true,
        }));
    }
  }
  
  
  customElements.define("duolingo-card-editor", DuolingoCardEditor);
  // Register the card editor with Home Assistant (useful for documentation or previews)