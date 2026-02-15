import axios from 'axios';

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
const PINATA_JWT = process.env.PINATA_JWT;

export class IPFSService {
    private static readonly BASE_URL = 'https://api.pinata.cloud';

    /**
     * Upload JSON metadata to IPFS
     */
    static async uploadJSON(data: any, fileName: string = 'metadata.json'): Promise<string> {
        if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_API_SECRET)) {
            console.warn('Pinata API keys not configured. Returning mock CID.');
            return `mock-cid-${Date.now()}`;
        }

        try {
            const config = PINATA_JWT
                ? { headers: { Authorization: `Bearer ${PINATA_JWT}` } }
                : { headers: { pinata_api_key: PINATA_API_KEY, pinata_secret_api_key: PINATA_API_SECRET } };

            const response = await axios.post(`${this.BASE_URL}/pinning/pinJSONToIPFS`, {
                pinataContent: data,
                pinataMetadata: { name: fileName }
            }, config);

            return response.data.IpfsHash;
        } catch (error: any) {
            console.error('Error uploading JSON to Pinata:', error.response?.data || error.message);
            throw new Error(`IPFS Upload Failed: ${error.message}`);
        }
    }

    /**
     * Upload a file (as base64 or buffer) to IPFS
     */
    static async uploadFile(fileData: string | Buffer, fileName: string): Promise<string> {
        if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_API_SECRET)) {
            console.warn('Pinata API keys not configured. Returning mock CID.');
            return `mock-cid-file-${Date.now()}`;
        }

        try {
            const formData: any = new (await import('form-data')).default();

            let buffer: Buffer;
            if (typeof fileData === 'string' && fileData.includes('base64,')) {
                buffer = Buffer.from(fileData.split('base64,')[1], 'base64');
            } else if (typeof fileData === 'string') {
                buffer = Buffer.from(fileData);
            } else {
                buffer = fileData;
            }

            formData.append('file', buffer, { filename: fileName });
            formData.append('pinataMetadata', JSON.stringify({ name: fileName }));

            const headers = PINATA_JWT
                ? { Authorization: `Bearer ${PINATA_JWT}`, ...formData.getHeaders() }
                : {
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_API_SECRET,
                    ...formData.getHeaders()
                };

            const response = await axios.post(`${this.BASE_URL}/pinning/pinFileToIPFS`, formData, {
                headers,
                maxBodyLength: Infinity
            });

            return response.data.IpfsHash;
        } catch (error: any) {
            console.error('Error uploading file to Pinata:', error.response?.data || error.message);
            throw new Error(`IPFS File Upload Failed: ${error.message}`);
        }
    }

    /**
     * Get a public gateway URL for a CID
     */
    static getGatewayUrl(cid: string): string {
        return `https://gateway.pinata.cloud/ipfs/${cid}`;
    }
}
