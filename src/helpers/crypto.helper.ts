import crypto from "node:crypto";

class CryptoHelper {
  public static hmac = (key: crypto.BinaryLike | crypto.KeyObject, data: crypto.BinaryLike) =>
    crypto.createHmac("sha256", key).update(data).digest("hex");
}

export default CryptoHelper;
