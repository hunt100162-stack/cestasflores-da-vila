import { describe, expect, it } from "vitest";
import { validateImage } from "./images";

describe("validateImage", () => {
  it("accepts a 2 MB jpeg", () => expect(validateImage({ type: "image/jpeg", size: 2e6 })).toBeNull());
  it("rejects files over 5 MB", () => expect(validateImage({ type: "image/png", size: 6 * 1024 * 1024 })).not.toBeNull());
  it("rejects non-image files", () => expect(validateImage({ type: "application/pdf", size: 1000 })).not.toBeNull());
});
