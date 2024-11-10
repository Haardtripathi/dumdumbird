import Arweave from 'arweave';

declare global {
    interface Window {
        arweaveWallet?: {
            connect: (permissions: string[]) => Promise<void>;
            disconnect: () => Promise<void>;
            getActiveAddress: () => Promise<string>;
        };
    }
}

export const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
});

const checkForArConnect = (): boolean => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
        return false;
    }

    // Check if ArConnect is installed
    return window.arweaveWallet !== undefined;
};

export async function connectToArConnect(): Promise<string> {
    // Wait for window to be defined (important for Next.js)
    if (typeof window === 'undefined') {
        throw new Error('Cannot connect to ArConnect: Browser environment not available');
    }

    // Add a small delay to ensure window.arweaveWallet is initialized
    await new Promise(resolve => setTimeout(resolve, 100));

    if (!checkForArConnect()) {
        // Provide a more helpful error message with installation instructions
        throw new Error(
            'ArConnect wallet not found. Please install ArConnect from https://arconnect.io and refresh the page'
        );
    }

    try {
        await window.arweaveWallet?.connect(['ACCESS_ADDRESS', 'SIGN_TRANSACTION']);
        const address = await window.arweaveWallet?.getActiveAddress();

        if (!address) {
            throw new Error('Failed to get wallet address');
        }

        return address;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to connect to ArConnect: ${error.message}`);
        }
        throw new Error('An unknown error occurred while connecting to ArConnect');
    }
}

export async function disconnectFromArConnect(): Promise<void> {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
        return;
    }

    try {
        if (checkForArConnect()) {
            await window.arweaveWallet?.disconnect();
        }
    } catch (error) {
        console.error('Error disconnecting from ArConnect:', error);
        throw new Error('Failed to disconnect from ArConnect');
    }
}

// Helper function to check if wallet is connected
export async function isWalletConnected(): Promise<boolean> {
    if (!checkForArConnect()) {
        return false;
    }

    try {
        const address = await window.arweaveWallet?.getActiveAddress();
        return !!address;
    } catch {
        return false;
    }
}