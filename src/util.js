function timeout(msecs) {
  return new Promise(function timer(resolve) {
    setTimeout(() => {
      resolve();
    }, msecs);
  });
}

export { timeout };
