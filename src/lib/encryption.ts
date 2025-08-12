import CryptoJS from 'crypto-js'

/**
 * Encrypts sensitive data using AES encryption
 * @param text - The text to encrypt
 * @param secretKey - The secret key for encryption (should be from environment)
 * @returns Encrypted string
 */
export function encryptData(text: string, secretKey: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(text, secretKey).toString()
    return encrypted
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypts data that was encrypted with encryptData
 * @param encryptedText - The encrypted text to decrypt
 * @param secretKey - The secret key for decryption (should be from environment)
 * @returns Decrypted string
 */
export function decryptData(encryptedText: string, secretKey: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, secretKey)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    
    if (!decrypted) {
      throw new Error('Failed to decrypt - invalid key or corrupted data')
    }
    
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

/**
 * Gets the decrypted OpenAI API key
 * @returns The decrypted OpenAI API key
 */
export function getDecryptedOpenAIKey(): string {
  const encryptedKey = process.env.OPENAI_API_KEY_ENCRYPTED
  const encryptionKey = process.env.ENCRYPTION_SECRET_KEY
  
  if (!encryptedKey) {
    // Fallback to plain text key for backwards compatibility
    const plainKey = process.env.OPENAI_API_KEY
    if (!plainKey) {
      throw new Error('No OpenAI API key found in environment variables')
    }
    return plainKey
  }
  
  if (!encryptionKey) {
    throw new Error('ENCRYPTION_SECRET_KEY environment variable is required when using encrypted API key')
  }
  
  try {
    return decryptData(encryptedKey, encryptionKey)
  } catch (error) {
    console.error('Failed to decrypt OpenAI API key:', error)
    throw new Error('Failed to decrypt OpenAI API key')
  }
}

/**
 * Utility function to encrypt an API key for storage
 * This is typically used in a setup script or admin function
 * @param apiKey - The plain text API key to encrypt
 * @param secretKey - The secret key for encryption
 * @returns Encrypted API key string
 */
export function encryptApiKey(apiKey: string, secretKey: string): string {
  return encryptData(apiKey, secretKey)
}
