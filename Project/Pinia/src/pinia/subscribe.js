function addSubscription(subscriptions, callback) {
  subscriptions.push(callback);

  const removeSubscription = () => {
    const index = subscriptions.findIndex((cb) => {
      callback === cb;
    });
    if (index !== -1) {
      subscriptions.splice(index, 1);
    }
  };

  return removeSubscription;
}

function triggerSubscriptions(subscriptions, ...args) {
  subscriptions.slice().forEach((cb) => cb(...args));
}

export { addSubscription, triggerSubscriptions };
