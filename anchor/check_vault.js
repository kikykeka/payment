const { Connection, PublicKey } = require('@solana/web3.js');
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const PROGRAM_ID = new PublicKey('HSvH1CMkjiY6ce5B4BjuHNkHdan6sGb9J5d1WUUJf1GM');

async function run() {
  const [registryPda] = PublicKey.findProgramAddressSync([Buffer.from("registry")], PROGRAM_ID);
  const propId = 'tokyo-apt-006-v2';
  const [propertyPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("property"), registryPda.toBuffer(), Buffer.from(propId)],
    PROGRAM_ID
  );
  
  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), propertyPda.toBuffer()],
    PROGRAM_ID
  );
  
  console.log('Vault PDA:', vaultPda.toBase58());
  const balance = await connection.getBalance(vaultPda);
  console.log('Vault Balance:', balance / 1e9, 'SOL');
}
run();
