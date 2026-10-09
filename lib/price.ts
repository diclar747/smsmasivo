import { DEFAULT_PRICE } from "./site";

/** Precio por SMS vigente (PRICE_PER_CREDIT); si no se puede leer, el valor por defecto. */
export async function getPrice(): Promise<number> {
  try {
    const { config } = await import("./server");
    return Number(config.PRICE_PER_CREDIT) || DEFAULT_PRICE;
  } catch { return DEFAULT_PRICE; }
}
