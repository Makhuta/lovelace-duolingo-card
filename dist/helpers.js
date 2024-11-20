export function entity_is_in_device(hass, entity, device_name) {
    const hassEntity = hass.entities[entity];
    if(!hassEntity) return false;
    const entityDevice = hass.devices[hassEntity.device_id];
    if(!entityDevice) return false;
    return entityDevice.name.toLowerCase() == device_name.toLowerCase();
}

export function entity_has_all_requirements(entity, requirements) {
    const attrs = entity.attributes;
    for(const key in attrs) {
        if(typeof(attrs[key]) == "object") {
            if(!requirements.every(k => Object.keys(attrs[key]).includes(k))) return false;
        }
    }

    return true;
}

export function remove_child_tree(element) {
    for(var child in element.children) {
        remove_child_tree(child);
        element.removeChild(child);
    }
}