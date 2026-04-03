import { compressToBase64, decompressFromBase64 } from 'lz-string';
import type { Vault } from '@/types/vault';

/**
 * Encode vault state to save code
 * Flow: state → JSON.stringify → LZ-string compress → base64 encode
 */
export function encodeSaveCode(vault: Vault): string {
  try {
    const jsonString = JSON.stringify(vault);
    const compressed = compressToBase64(jsonString);
    return compressed;
  } catch (error) {
    console.error('Failed to encode save code:', error);
    throw new Error('Failed to encode save code');
  }
}

/**
 * Decode save code to vault state
 * Flow: save code → base64 decode → LZ-string decompress → JSON.parse
 */
export function decodeSaveCode(code: string): Vault | null {
  try {
    const decompressed = decompressFromBase64(code);
    if (!decompressed) {
      throw new Error('Failed to decompress save code');
    }
    const vault: Vault = JSON.parse(decompressed);
    return vault;
  } catch (error) {
    console.error('Failed to decode save code:', error);
    return null;
  }
}

/**
 * Download save code as .txt file
 */
export function downloadSaveCodeAsFile(saveCode: string, filename?: string): void {
  const blob = new Blob([saveCode], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `codiroom-vault-backup-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Read save code from uploaded file
 */
export async function readSaveCodeFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        resolve(content.trim());
      } else {
        reject(new Error('File is empty'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsText(file);
  });
}

/**
 * Copy save code to clipboard
 */
export async function copySaveCodeToClipboard(saveCode: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(saveCode);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
