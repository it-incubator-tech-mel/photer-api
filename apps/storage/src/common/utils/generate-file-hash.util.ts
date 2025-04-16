import { createHash } from 'crypto';

export const generateFileHash = async (buffer: Buffer): Promise<string> => {
  try {
    const hash = createHash('sha256');
    hash.update(buffer);
    return hash.digest('hex');
  } catch (error) {
    throw new Error(`Failed to generate file hash: ${error.message}`);
  }
};
