const messageInstances: any[] = [];
const getInstance = (id) => {
  const idx = messageInstances.findIndex((instance) => instance.id === id);
  const current = messageInstances[idx];
  let prev;
  if (idx > 0) {
    prev = messageInstances[idx - 1];
  }
  return { current, prev };
};
const getLastOffset = (id) => {
  const { prev } = getInstance(id);
  if (!prev) return 0;
  return prev.vm.exposed.bottom.value;
};

const getOffsetOrSpace = (id, offset) => {
  const idx = messageInstances.findIndex((instance) => instance.id === id);
  return idx > 0 ? 20 : offset;
};

export { getInstance, getLastOffset, getOffsetOrSpace, messageInstances };
