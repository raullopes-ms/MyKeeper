import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";
import { env } from "@/env";

const algorithm = "aes-256-gcm";
const ivLength = 12;

function getEncryptionKey() {
  const key = Buffer.from(env.VAULT_KEY, "base64");

  if (key.length !== 32) {
    throw new Error(
      "VAULT_ENCRYPTION_KEY precisa representar exatamente 32 bytes",
    );
  }

  return key;
}

export function encrypt(text: string): string {
  const iv = randomBytes(ivLength);
  const cipher = createCipheriv(algorithm, getEncryptionKey(), iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
}

export function decrypt(payload: string): string {
  const [ivBase64, authTagBase64, encryptedBase64] = payload.split(".");

  if (!ivBase64 || !authTagBase64 || !encryptedBase64) {
    throw new Error("Formato de senha criptografada inválido");
  }

  const decipher = createDecipheriv(
    algorithm,
    getEncryptionKey(),
    Buffer.from(ivBase64, "base64"),
  );

  decipher.setAuthTag(Buffer.from(authTagBase64, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedBase64, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}