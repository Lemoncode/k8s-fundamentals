export const delay = (delayAmount: number) =>
  new Promise<void>((res) => {
    const seconds = delayAmount * 1_000;
    setTimeout(() => {
      res();
    }, seconds);
  });
