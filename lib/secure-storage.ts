import { AES, enc } from "crypto-js"

// Storage key for encrypted data
const STORAGE_KEY = "bizconnect_secure_data"

// Use a combination of environment variables and browser-specific data as encryption key
// This is a simplified approach - in production, consider using a more robust key derivation
function getEncryptionKey(): string {
  const envKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "default-encryption-key"
  const browserKey = navigator.userAgent + window.screen.width + window.screen.height
  return envKey + browserKey
}

export function secureStore(key: string, value: any): void {
  try {
    // Get existing data
    const existingData = secureRetrieve() || {}

    // Update with new value
    const updatedData = {
      ...existingData,
      [key]: value,
    }

    // Encrypt and store
    const encryptionKey = getEncryptionKey()
    const encryptedData = AES.encrypt(JSON.stringify(updatedData), encryptionKey).toString()
    localStorage.setItem(STORAGE_KEY, encryptedData)
  } catch (error) {
    console.error("Error storing secure data:", error)
  }
}

export function secureRetrieve(key?: string): any {
  try {
    const encryptedData = localStorage.getItem(STORAGE_KEY)
    if (!encryptedData) return key ? null : {}

    const encryptionKey = getEncryptionKey()
    const decryptedBytes = AES.decrypt(encryptedData, encryptionKey)
    const decryptedData = JSON.parse(decryptedBytes.toString(enc.Utf8))

    return key ? decryptedData[key] : decryptedData
  } catch (error) {
    console.error("Error retrieving secure data:", error)
    return key ? null : {}
  }
}

export function secureRemove(key: string): void {
  try {
    const existingData = secureRetrieve() || {}
    if (!existingData[key]) return

    // Remove the key
    delete existingData[key]

    // Re-encrypt and store
    const encryptionKey = getEncryptionKey()
    const encryptedData = AES.encrypt(JSON.stringify(existingData), encryptionKey).toString()
    localStorage.setItem(STORAGE_KEY, encryptedData)
  } catch (error) {
    console.error("Error removing secure data:", error)
  }
}

export function secureClear(): void {
  localStorage.removeItem(STORAGE_KEY)
}

