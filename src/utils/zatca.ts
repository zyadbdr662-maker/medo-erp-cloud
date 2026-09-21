export function generateZatcaQr(
  sellerName: string,
  vatRegistrationNumber: string,
  timestamp: string,
  invoiceTotal: string,
  vatTotal: string
): string {
  const getHex = (tag: number, value: string) => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(value);
    
    // Tag
    const tagHex = tag.toString(16).padStart(2, '0');
    // Length
    const lengthHex = bytes.length.toString(16).padStart(2, '0');
    // Value
    const valueHex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    
    return tagHex + lengthHex + valueHex;
  };

  const tlvHex = 
    getHex(1, sellerName) +
    getHex(2, vatRegistrationNumber) +
    getHex(3, timestamp) +
    getHex(4, invoiceTotal) +
    getHex(5, vatTotal);

  // Convert hex to bytes
  const bytes = new Uint8Array(tlvHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
  
  // Convert bytes to base64
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
