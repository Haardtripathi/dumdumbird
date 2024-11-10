import Arweave from 'arweave';

// Define ArConnect permission types
type PermissionType = 'ACCESS_ADDRESS' | 'SIGN_TRANSACTION' | 'ACCESS_PUBLIC_KEY' | 'SIGNATURE';

interface ArConnectError extends Error {
    code?: string;
}

export const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
});

// Helper to detect the browser environment
const getBrowserInfo = () => {
    if (typeof window === 'undefined') return 'server';

    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('mobile')) {
        // Detect specific mobile browsers
        if (userAgent.includes('ios')) return 'ios';
        if (userAgent.includes('android')) return 'android';
        return 'mobile';
    }
    return 'desktop';
};

// Helper to get installation instructions based on browser
const getInstallationInstructions = () => {
    const browser = getBrowserInfo();
    switch (browser) {
        case 'ios':
            return 'ArConnect is not available on iOS. Please use a desktop browser.';
        case 'android':
            return 'Please install ArConnect from the Chrome Web Store and use Chrome mobile browser.';
        case 'mobile':
            return 'Please use Chrome mobile browser and install ArConnect extension.';
        case 'desktop':
            return 'Please install ArConnect from https://arconnect.io';
        default:
            return 'Please install ArConnect from https://arconnect.io';
    }
};

// Check if ArConnect is available
const checkForArConnect = (): boolean => {
    return typeof window !== 'undefined' && 'arweaveWallet' in window;
};

// Wait for ArConnect to initialize
const waitForArConnect = async (timeout = 2000): Promise<void> => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        if (checkForArConnect()) return;
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error(getInstallationInstructions());
};

export async function connectToArConnect(): Promise<string> {
    try {
        // Wait for ArConnect to initialize
        await waitForArConnect();

        if (!checkForArConnect()) {
            throw new Error(getInstallationInstructions());
        }

        // Request permissions
        await window.arweaveWallet?.connect([
            'ACCESS_ADDRESS',
            'SIGN_TRANSACTION'
        ] as PermissionType[]);

        // Get wallet address
        const address = await window.arweaveWallet?.getActiveAddress();

        if (!address) {
            throw new Error('Failed to get wallet address. Please try again.');
        }

        return address;
    } catch (error) {
        const err = error as ArConnectError;

        // Handle specific ArConnect errors
        if (err.code === 'PERMISSION_DENIED') {
            throw new Error('Connection rejected. Please approve the connection request.');
        }

        if (err.message?.includes('timeout')) {
            throw new Error(getInstallationInstructions());
        }

        // Re-throw the original error with more context if needed
        throw new Error(err.message || 'Failed to connect to ArConnect. Please try again.');
    }
}

export async function disconnectFromArConnect(): Promise<void> {
    if (checkForArConnect()) {
        try {
            await window.arweaveWallet?.disconnect();
        } catch (error) {
            console.error('Error disconnecting from ArConnect:', error);
            throw new Error('Failed to disconnect from ArConnect');
        }
    }
}

export async function isWalletConnected(): Promise<boolean> {
    if (!checkForArConnect()) return false;

    try {
        const address = await window.arweaveWallet?.getActiveAddress();
        return !!address;
    } catch {
        return false;
    }
}