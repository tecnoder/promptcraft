/**
 * Utility script to encrypt an OpenAI API key
 * Usage: node scripts/encrypt-api-key.js <your-api-key> <encryption-secret>
 * 
 * Example:
 * node scripts/encrypt-api-key.js sk-1234567890abcdef mysecretkey123
 */

const CryptoJS = require('crypto-js')

function encryptApiKey(apiKey, secretKey) {
  try {
    const encrypted = CryptoJS.AES.encrypt(apiKey, secretKey).toString()
    return encrypted
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt API key')
  }
}

function main() {
  const args = process.argv.slice(2)
  
  if (args.length !== 2) {
    console.log('Usage: node scripts/encrypt-api-key.js <api-key> <encryption-secret>')
    console.log('Example: node scripts/encrypt-api-key.js sk-1234567890abcdef mysecretkey123')
    process.exit(1)
  }
  
  const [apiKey, secretKey] = args
  
  if (!apiKey.startsWith('sk-')) {
    console.error('Warning: API key should start with "sk-"')
  }
  
  if (secretKey.length < 16) {
    console.error('Warning: Encryption secret should be at least 16 characters long')
  }
  
  try {
    const encryptedKey = encryptApiKey(apiKey, secretKey)
    
    console.log('✅ API key encrypted successfully!')
    console.log('\nAdd these to your .env file:')
    console.log(`OPENAI_API_KEY_ENCRYPTED=${encryptedKey}`)
    console.log(`ENCRYPTION_SECRET_KEY=${secretKey}`)
    console.log('\nRemove or comment out:')
    console.log('# OPENAI_API_KEY=sk-...')
    console.log('\n⚠️  Keep your ENCRYPTION_SECRET_KEY secure and never commit it to version control!')
    
  } catch (error) {
    console.error('❌ Failed to encrypt API key:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { encryptApiKey }
