function filterBy(string, item) {
    // FIXME: For now this function only filters by metadata, but we could do
    // it for the whole `item` object.
    if (typeof item.meta === 'string') {
        return item.meta.indexOf(string) !== -1;
    }

    if (item.meta) {
        return JSON.stringify(item.meta).indexOf(string) !== -1;
    }

    return false;
}

module.exports = filterBy;
