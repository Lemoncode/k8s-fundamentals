export const delay = (delayAmount: number) =>
  new Promise<void>((res) => {
    setTimeout(() => {
      res();
    }, delayAmount);
  });
